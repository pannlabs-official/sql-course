# Chapter 10 - Performance Optimization

---

## Chapter Overview

Writing correct SQL is necessary. Writing *fast* SQL is what separates a junior analyst from someone who can handle real-world data at scale. When your query takes 45 minutes instead of 2 seconds, the difference is usually not the data - it is how you wrote the query.

This chapter teaches you to understand how MySQL executes queries, use EXPLAIN to diagnose bottlenecks, create and manage indexes, write SARGable predicates, and apply optimisation patterns that make queries orders of magnitude faster.

### Prerequisites

- Completed Chapters 1–9
- `salesdb` and `employees` (93MB large-scale database) loaded

### Reference Scripts

`24_Indexes.sql`, `25_Partitions.sql`, `26_Performance_Optimization.sql`

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Use `EXPLAIN` to read and interpret query execution plans
2. Create, manage, and drop indexes
3. Understand B-tree index mechanics and the leftmost prefix rule
4. Write SARGable WHERE clauses that use indexes
5. Identify and eliminate common performance anti-patterns
6. Understand table partitioning concepts
7. Profile queries and interpret timing data

---

## 10.1 How Queries Execute

When you run a query, MySQL does not simply scan every row. It follows a process:

1. **Parse** - Check syntax
2. **Optimise** - The query optimiser decides the best execution strategy (which indexes to use, join order, etc.)
3. **Execute** - Run the chosen plan
4. **Return** - Send results to the client

The optimiser's job is to find the **cheapest** execution plan. "Cheapest" means fewest disk reads, fewest comparisons, and least memory usage.

---

## 10.2 EXPLAIN - Reading Execution Plans

`EXPLAIN` shows you the execution plan **without** running the query.

### 10.2.1 Basic EXPLAIN

```sql
EXPLAIN SELECT * FROM orders WHERE customerid = 2;
```

| id | select_type | table | type | possible_keys | key | rows | Extra |
|---|---|---|---|---|---|---|---|
| 1 | SIMPLE | orders | ALL | NULL | NULL | 10 | Using where |

**Reading this output**:
- `type: ALL` - **Full table scan.** MySQL is reading every row. This is the worst-case scenario.
- `key: NULL` - No index is being used.
- `rows: 10` - MySQL estimates it needs to examine 10 rows.
- `Extra: Using where` - A WHERE filter is applied, but without an index.

### 10.2.2 After Adding an Index

```sql
CREATE INDEX idx_orders_customerid ON orders(customerid);
EXPLAIN SELECT * FROM orders WHERE customerid = 2;
```

| id | select_type | table | type | possible_keys | key | rows | Extra |
|---|---|---|---|---|---|---|---|
| 1 | SIMPLE | orders | ref | idx_orders_customerid | idx_orders_customerid | 3 | NULL |

Now:
- `type: ref` - MySQL is using the index to look up matching rows. Much better.
- `key: idx_orders_customerid` - The index we created is being used.
- `rows: 3` - Only 3 rows examined (instead of 10).

### 10.2.3 EXPLAIN Key Columns

| Column | Meaning |
|---|---|
| `type` | Access method. From best to worst: `system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL` |
| `possible_keys` | Indexes that MySQL *could* use |
| `key` | Index that MySQL *actually* chose |
| `rows` | Estimated rows to examine |
| `Extra` | Additional info: `Using index` (covering), `Using filesort` (needs sorting), `Using temporary` (temp table) |

**EXPLAIN type values ranked**:

| Type | Meaning | Performance |
|---|---|---|
| `const` | Exact match on primary key or unique index | ⚡ Best |
| `eq_ref` | One match per row from previous table (PK/unique JOIN) | ⚡ Excellent |
| `ref` | Multiple matches via non-unique index | ✅ Good |
| `range` | Index range scan (BETWEEN, >, <, IN) | ✅ Good |
| `index` | Full index scan (reads entire index, not table) | ⚠️ OK |
| `ALL` | Full table scan (reads every row) | ❌ Worst |

---

## 10.3 Indexes

### 10.3.1 What Is an Index?

An index is a data structure (usually a B-tree) that allows MySQL to find rows quickly without scanning the entire table. Think of it like a book's index - instead of reading every page to find "window functions," you look up the term in the index and go directly to page 142.

### 10.3.2 Creating Indexes

```sql
-- Single-column index
CREATE INDEX idx_customers_country ON customers(country);

-- Multi-column (composite) index
CREATE INDEX idx_orders_status_date ON orders(orderstatus, orderdate);

-- Unique index (also enforces uniqueness)
CREATE UNIQUE INDEX idx_customers_email ON customers(email);
```

### 10.3.3 The Leftmost Prefix Rule

For composite indexes, MySQL can use the index **only if the query filters on a leftmost prefix** of the indexed columns.

If you create: `INDEX(orderstatus, orderdate, productid)`

| Query WHERE clause | Uses Index? | Why |
|---|---|---|
| `WHERE orderstatus = 'Shipped'` | ✅ Yes | Matches the leftmost column |
| `WHERE orderstatus = 'Shipped' AND orderdate = '2025-01-05'` | ✅ Yes | Matches leftmost 2 columns |
| `WHERE orderstatus = 'Shipped' AND orderdate = '2025-01-05' AND productid = 101` | ✅ Yes | Matches all 3 columns |
| `WHERE orderdate = '2025-01-05'` | ❌ No | Skips the leftmost column |
| `WHERE productid = 101` | ❌ No | Skips the first two columns |
| `WHERE orderstatus = 'Shipped' AND productid = 101` | ⚠️ Partial | Uses only the `orderstatus` part |

### 10.3.4 Covering Indexes

A covering index contains **all columns** the query needs. MySQL can answer the query entirely from the index without touching the table data (shown as `Using index` in EXPLAIN).

```sql
CREATE INDEX idx_orders_covering ON orders(customerid, sales);

EXPLAIN SELECT customerid, sales FROM orders WHERE customerid = 2;
-- Extra: Using index  ← covering index, no table lookup needed
```

### 10.3.5 When NOT to Index

- **Low-cardinality columns**: A column with only 2 values (e.g., gender: M/F) is rarely worth indexing. The index does not narrow the search much.
- **Small tables**: Tables with < 1,000 rows are fast to scan. The overhead of maintaining an index is not worth it.
- **Frequently updated columns**: Every INSERT/UPDATE/DELETE must also update the index. Too many indexes slow down writes.

### 10.3.6 Viewing and Dropping Indexes

```sql
-- View indexes on a table
SHOW INDEX FROM orders;

-- Drop an index
DROP INDEX idx_orders_customerid ON orders;
```

---

## 10.4 Query Optimization Patterns

### 10.4.1 SARGable Predicates - The #1 Optimization Rule

**SARGable** (Search ARGument able) means a WHERE condition can use an index. The rule: **never apply a function to the indexed column**.

```sql
-- ❌ Non-SARGable: function on column kills index usage
WHERE YEAR(orderdate) = 2025
-- MySQL must evaluate YEAR() for EVERY row - full table scan

-- ✅ SARGable: compare column directly
WHERE orderdate >= '2025-01-01' AND orderdate < '2026-01-01'
-- MySQL uses the index on orderdate to jump directly to the range
```

More examples:

```sql
-- ❌ Non-SARGable
WHERE UPPER(country) = 'GERMANY'
WHERE salary * 2 > 100000
WHERE CONCAT(firstname, ' ', lastname) = 'Kevin Brown'

-- ✅ SARGable equivalents
WHERE country = 'Germany'        -- MySQL comparison is CI by default
WHERE salary > 50000
WHERE firstname = 'Kevin' AND lastname = 'Brown'
```

### 10.4.2 Avoid SELECT *

```sql
-- ❌ Retrieves all columns, prevents covering index usage
SELECT * FROM orders WHERE customerid = 2;

-- ✅ Select only what you need
SELECT orderid, orderdate, sales FROM orders WHERE customerid = 2;
```

### 10.4.3 Replace Correlated Subqueries with JOINs

```sql
-- ❌ Slow: correlated subquery runs once per outer row
SELECT c.firstname,
    (SELECT SUM(sales) FROM orders o WHERE o.customerid = c.customerid) AS total
FROM customers c;

-- ✅ Faster: JOIN + GROUP BY runs once
SELECT c.firstname, COALESCE(SUM(o.sales), 0) AS total
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
GROUP BY c.firstname;
```

### 10.4.4 Use UNION ALL Instead of UNION

```sql
-- ❌ UNION removes duplicates (requires sorting)
SELECT * FROM orders UNION SELECT * FROM orders_archive;

-- ✅ UNION ALL skips deduplication (faster)
SELECT * FROM orders UNION ALL SELECT * FROM orders_archive;
```

### 10.4.5 Implicit Type Conversions

```sql
-- ❌ customerid is INT but we pass a string - forces conversion on every row
WHERE customerid = '2'

-- ✅ Match the data type
WHERE customerid = 2
```

### 10.4.6 EXISTS vs IN for Large Datasets

```sql
-- For large subquery results, EXISTS often outperforms IN
-- because EXISTS stops at the first match

-- ✅ Better for large inner table
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customerid = c.customerid)

-- ⚠️ Slower if inner table is very large
WHERE customerid IN (SELECT customerid FROM orders)
```

---

## 10.5 Partitioning

Table partitioning divides a large table into smaller, manageable pieces based on a column value. Queries that filter on the partition column only scan the relevant partition.

### 10.5.1 Range Partitioning

```sql
CREATE TABLE orders_partitioned (
    orderid INT,
    orderdate DATE,
    sales INT
)
PARTITION BY RANGE (YEAR(orderdate)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

A query with `WHERE orderdate BETWEEN '2025-01-01' AND '2025-12-31'` only scans partition `p2025`, skipping all other partitions.

### 10.5.2 When to Use Partitioning

| Scenario | Partition? |
|---|---|
| Table > 10 million rows with date-based queries | ✅ Yes |
| Small table (< 100K rows) | ❌ No (overhead not worth it) |
| Need to archive/drop old data quickly | ✅ Yes (`ALTER TABLE DROP PARTITION` is instant) |
| Queries rarely filter on the partition column | ❌ No (partitioning provides no benefit) |

---

## 10.6 Query Profiling

### 10.6.1 Timing a Query

```sql
-- Enable profiling for this session
SET profiling = 1;

-- Run a query
SELECT * FROM employees.employees WHERE hire_date > '1999-01-01';

-- View the profile
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

### 10.6.2 Benchmarking with the employees Database

The `employees` database (93MB, ~300K employees, ~2.8M salary records) is where you can see real performance differences:

```sql
USE employees;

-- Without index: full table scan
EXPLAIN SELECT * FROM salaries WHERE salary > 100000;
-- type: ALL, rows: ~2,844,047

-- With index
CREATE INDEX idx_salaries_salary ON salaries(salary);
EXPLAIN SELECT * FROM salaries WHERE salary > 100000;
-- type: range, rows: ~much fewer
```

---

## 10.7 Summary: The Optimization Checklist

| # | Check | Action |
|---|---|---|
| 1 | Are you using `SELECT *`? | Select only needed columns |
| 2 | Is your WHERE clause SARGable? | No functions on indexed columns |
| 3 | Does the filtered column have an index? | Create one if needed |
| 4 | Are you using UNION instead of UNION ALL? | Use UNION ALL when duplicates are OK |
| 5 | Correlated subquery? | Rewrite as JOIN |
| 6 | Is EXPLAIN showing `type: ALL`? | Add an index or rewrite the query |
| 7 | Implicit type conversion? | Match data types in comparisons |
| 8 | Using OR on different columns? | Consider UNION for better index usage |
| 9 | Large table with date-range queries? | Consider partitioning |
| 10 | Too many indexes on write-heavy tables? | Remove unused indexes |

---

## Practice Exercises

### Beginner

**Exercise 10.1**: Run `EXPLAIN` on `SELECT * FROM orders WHERE orderid = 5`. What is the `type`? Why?

**Exercise 10.2**: Create an index on `customers(country)`. Run EXPLAIN on a query filtering by country. Compare before and after.

### Intermediate

**Exercise 10.3**: Using the `employees` database, run `EXPLAIN` on: `SELECT * FROM salaries WHERE salary BETWEEN 60000 AND 80000`. Create an index and run EXPLAIN again.

**Exercise 10.4**: Rewrite this non-SARGable query to be SARGable:
```sql
SELECT * FROM orders WHERE MONTH(orderdate) = 3;
```

**Exercise 10.5**: Create a composite index on `orders(orderstatus, orderdate)`. Test which queries use it and which do not (leftmost prefix rule).

### Challenge

**Exercise 10.6**: Using the `employees` database, write a query that finds the top 5 highest-paid employees in each department. Optimise it with appropriate indexes and verify with EXPLAIN.

**Exercise 10.7**: Compare the performance of a correlated subquery vs a JOIN for finding employees whose salary exceeds their department's average. Use `SHOW PROFILES` to measure the difference.

---

## Key Takeaways

1. **EXPLAIN is your diagnostic tool.** Run it before optimising. The `type` column tells you how MySQL accesses data: `ALL` (scan everything) is bad, `ref`/`range` (indexed lookup) is good.

2. **Indexes are the primary optimisation mechanism.** They transform O(n) full scans into O(log n) lookups. But they are not free - each index adds overhead to writes.

3. **The leftmost prefix rule** governs composite indexes. `INDEX(a, b, c)` works for queries filtering on `(a)`, `(a, b)`, or `(a, b, c)` - but not `(b)` alone.

4. **SARGable predicates are non-negotiable.** Never wrap an indexed column in a function. `WHERE YEAR(date) = 2025` kills performance; `WHERE date >= '2025-01-01' AND date < '2026-01-01'` uses the index.

5. **Covering indexes** eliminate table lookups entirely. If the index contains all columns the query needs, MySQL answers from the index alone.

6. **Partitioning** helps for very large tables with predictable access patterns (e.g., date-range queries on multi-million-row tables).

---

## PostgreSQL Assignment

**PG-10.1**: Run `EXPLAIN ANALYZE` (PostgreSQL's enhanced version) on a query. Compare the output format to MySQL's EXPLAIN.

**PG-10.2**: Create an index in PostgreSQL and compare the execution plan before and after.

**PG-10.3**: Research PostgreSQL's `pg_stat_statements` extension for query performance monitoring.

---

## Next Chapter

→ **Chapter 11 - AI & SQL**: How AI tools can help you write, debug, optimise, and learn SQL faster.
