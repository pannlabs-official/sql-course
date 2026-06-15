# Chapter 2 — Querying Data (SELECT)

---

## Chapter Overview

The `SELECT` statement is the backbone of SQL. You will use it in virtually every query you ever write. This chapter takes you from the basics you saw in Chapter 1 and systematically builds your understanding of every major component of a `SELECT` query: column selection, expressions, aliases, sorting, pagination, deduplication, grouping, and filtering groups.

By the end of this chapter, you will be able to construct `SELECT` queries that extract, transform, sort, and summarise data from any table.

### Prerequisites

- Completed Chapter 1 (Introduction)
- `salesdb` and `MyDatabase` loaded in MySQL

### Database Used

We switch to the `salesdb` database for the remainder of this course. It has richer data and proper relational structure.

```sql
USE salesdb;
```

The `salesdb` contains 5 tables. Let us quickly review them:

```sql
SHOW TABLES;
```

| Tables_in_salesdb |
|---|
| customers |
| employees |
| orders |
| orders_archive |
| products |

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Select specific columns from a table using `SELECT`
2. Create computed columns using expressions and arithmetic
3. Assign aliases to columns with `AS`
4. Remove duplicate rows with `DISTINCT`
5. Sort results with `ORDER BY` (single-column, multi-column, directional)
6. Limit result sets with `LIMIT` and `OFFSET`
7. Use `GROUP BY` to aggregate data by categories
8. Filter aggregated groups with `HAVING`
9. Combine all these clauses into a single, coherent query
10. Select static/constant values without a table

---

## 2.1 SELECT Fundamentals

### 2.1.1 Selecting All Columns

The `*` wildcard retrieves every column in the table:

```sql
-- Retrieve all columns from the customers table
SELECT * 
FROM customers;
```

**Expected output**:

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |
| 5 | Anna | Adams | USA | NULL |

Two things to notice immediately:
- Row 3: `lastname` is **NULL** — this is not an empty string, it is the absence of a value. NULL is a critical concept we will explore deeply in Chapter 5.
- Row 5: `score` is also **NULL**. Anna has no score recorded.

> ⚠️ **When to use `SELECT *`**: For quick exploration only. In production queries, reports, or application code, **always specify the exact columns you need.** `SELECT *` retrieves unnecessary data, increases network transfer, and makes your query fragile — if someone adds or removes columns from the table, your query's output changes unexpectedly.

### 2.1.2 Selecting Specific Columns

```sql
-- Retrieve only the customer's name and country
SELECT 
    firstname, 
    lastname, 
    country 
FROM customers;
```

**Expected output**:

| firstname | lastname | country |
|---|---|---|
| Jossef | Goldberg | Germany |
| Kevin | Brown | USA |
| Mary | NULL | USA |
| Mark | Schwarz | Germany |
| Anna | Adams | USA |

The column order in your output matches the order you specify in the `SELECT` clause — not the order they exist in the table definition.

```sql
-- You control the column order
SELECT 
    country, 
    firstname 
FROM customers;
```

| country | firstname |
|---|---|
| Germany | Jossef |
| USA | Kevin |
| USA | Mary |
| Germany | Mark |
| USA | Anna |

### 2.1.3 Selecting Data From Other Tables

```sql
-- Retrieve all employee data
SELECT * FROM employees;
```

| employeeid | firstname | lastname | department | birthdate | gender | salary | managerid |
|---|---|---|---|---|---|---|---|
| 1 | Frank | Lee | Marketing | 1988-12-05 | M | 55000 | NULL |
| 2 | Kevin | Brown | Marketing | 1972-11-25 | M | 65000 | 1 |
| 3 | Mary | NULL | Sales | 1986-01-05 | F | 75000 | 1 |
| 4 | Michael | Ray | Sales | 1977-02-10 | M | 90000 | 2 |
| 5 | Carol | Baker | Sales | 1982-02-11 | F | 55000 | 3 |

```sql
-- Retrieve all product data
SELECT * FROM products;
```

| productid | product | category | price |
|---|---|---|---|
| 101 | Bottle | Accessories | 10 |
| 102 | Tire | Accessories | 15 |
| 103 | Socks | Clothing | 20 |
| 104 | Caps | Clothing | 25 |
| 105 | Gloves | Clothing | 30 |

```sql
-- Retrieve all orders
SELECT * FROM orders;
```

| orderid | productid | customerid | salespersonid | orderdate | shipdate | orderstatus | shipaddress | billaddress | quantity | sales | creationtime |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 101 | 2 | 3 | 2025-01-01 | 2025-01-05 | Delivered | 9833 Mt. Dias Blv. | 1226 Shoe St. | 1 | 10 | 2025-01-01 12:34:56 |
| 2 | 102 | 3 | 3 | 2025-01-05 | 2025-01-10 | Shipped | 250 Race Court | NULL | 1 | 15 | 2025-01-05 23:22:04 |
| 3 | 101 | 1 | 5 | 2025-01-10 | 2025-01-25 | Delivered | 8157 W. Book | 8157 W. Book | 2 | 20 | 2025-01-10 18:24:08 |
| 4 | 105 | 1 | 3 | 2025-01-20 | 2025-01-25 | Shipped | 5724 Victory Lane | | 2 | 60 | 2025-01-20 05:50:33 |
| 5 | 104 | 2 | 5 | 2025-02-01 | 2025-02-05 | Delivered | NULL | NULL | 1 | 25 | 2025-02-01 14:02:41 |
| 6 | 104 | 3 | 5 | 2025-02-05 | 2025-02-10 | Delivered | 1792 Belmont Rd. | NULL | 2 | 50 | 2025-02-06 15:34:57 |
| 7 | 102 | 1 | 1 | 2025-02-15 | 2025-02-27 | Delivered | 136 Balboa Court | | 2 | 30 | 2025-02-16 06:22:01 |
| 8 | 101 | 4 | 3 | 2025-02-18 | 2025-02-27 | Shipped | 2947 Vine Lane | 4311 Clay Rd | 3 | 90 | 2025-02-18 10:45:22 |
| 9 | 101 | 2 | 3 | 2025-03-10 | 2025-03-15 | Shipped | 3768 Door Way | | 2 | 20 | 2025-03-10 12:59:04 |
| 10 | 102 | 3 | 5 | 2025-03-15 | 2025-03-20 | Shipped | NULL | NULL | 0 | 60 | 2025-03-16 23:25:15 |

---

## 2.2 Expressions and Arithmetic

SQL can compute values on the fly. You are not limited to retrieving raw column values — you can transform them.

### 2.2.1 Arithmetic in SELECT

```sql
-- Calculate the price after a 10% discount
SELECT 
    product, 
    price, 
    price * 0.9 AS discounted_price 
FROM products;
```

| product | price | discounted_price |
|---|---|---|
| Bottle | 10 | 9.0 |
| Tire | 15 | 13.5 |
| Socks | 20 | 18.0 |
| Caps | 25 | 22.5 |
| Gloves | 30 | 27.0 |

Available arithmetic operators:

| Operator | Meaning | Example |
|---|---|---|
| `+` | Addition | `price + 5` |
| `-` | Subtraction | `price - 5` |
| `*` | Multiplication | `price * 2` |
| `/` | Division | `price / 3` |
| `%` | Modulo (remainder) | `price % 3` |
| `DIV` | Integer division | `price DIV 3` |

### 2.2.2 Combining Columns in Expressions

```sql
-- Calculate total revenue per order (quantity × sales amount)
SELECT 
    orderid, 
    quantity, 
    sales, 
    quantity * sales AS total_revenue 
FROM orders;
```

| orderid | quantity | sales | total_revenue |
|---|---|---|---|
| 1 | 1 | 10 | 10 |
| 2 | 1 | 15 | 15 |
| 3 | 2 | 20 | 40 |
| 4 | 2 | 60 | 120 |
| 5 | 1 | 25 | 25 |
| ... | ... | ... | ... |

### 2.2.3 String Expressions

```sql
-- Combine first and last name into a full name
SELECT 
    firstname, 
    lastname, 
    CONCAT(firstname, ' ', lastname) AS full_name 
FROM customers;
```

| firstname | lastname | full_name |
|---|---|---|
| Jossef | Goldberg | Jossef Goldberg |
| Kevin | Brown | Kevin Brown |
| Mary | NULL | NULL |
| Mark | Schwarz | Mark Schwarz |
| Anna | Adams | Anna Adams |

> ❌ **Critical observation**: Row 3 (Mary) has `full_name` as **NULL**, not "Mary". This is because `CONCAT` with a NULL argument returns NULL in standard SQL. In MySQL specifically, `CONCAT` returns NULL if **any** argument is NULL. This is one of the most common surprises for beginners. We will learn to handle this with `IFNULL` and `COALESCE` in Chapter 7.

---

## 2.3 Column Aliases

### 2.3.1 The `AS` Keyword

An alias renames a column in the output. It does not change the actual column name in the table — it only affects how the result is displayed.

```sql
SELECT 
    firstname AS first_name, 
    lastname AS last_name, 
    score AS customer_score 
FROM customers;
```

| first_name | last_name | customer_score |
|---|---|---|
| Jossef | Goldberg | 350 |
| Kevin | Brown | 900 |
| Mary | NULL | 750 |
| Mark | Schwarz | 500 |
| Anna | Adams | NULL |

### 2.3.2 Aliases Without `AS`

The `AS` keyword is optional. You can write:

```sql
SELECT firstname first_name FROM customers;
-- Same as: SELECT firstname AS first_name FROM customers;
```

However, **always use `AS` explicitly.** Omitting it makes code harder to read and can cause ambiguous parsing in complex queries.

### 2.3.3 Aliases with Spaces or Special Characters

If your alias needs a space or special character, wrap it in backticks (MySQL) or double quotes (PostgreSQL):

```sql
-- MySQL: backticks for aliases with spaces
SELECT 
    firstname AS `First Name`, 
    score AS `Customer Score` 
FROM customers;
```

| First Name | Customer Score |
|---|---|
| Jossef | 350 |
| Kevin | 900 |
| ... | ... |

> **PostgreSQL**: Use double quotes instead: `"First Name"`, `"Customer Score"`.

### 2.3.4 Where Aliases Can Be Used (Execution Order Reminder)

Recall the execution order from Chapter 1:

| Clause | Can Use Aliases? | Why? |
|---|---|---|
| `WHERE` | ❌ No | WHERE executes before SELECT (where aliases are created) |
| `GROUP BY` | ✅ Yes (MySQL only) | MySQL extension — PostgreSQL requires the original expression |
| `HAVING` | ✅ Yes (MySQL only) | Same MySQL extension |
| `ORDER BY` | ✅ Yes | ORDER BY executes after SELECT |

---

## 2.4 DISTINCT

`DISTINCT` removes duplicate rows from the result set. It considers the **entire row**, not individual columns.

### 2.4.1 Basic Usage

```sql
-- What countries do our customers come from?
SELECT DISTINCT country 
FROM customers;
```

| country |
|---|
| Germany |
| USA |

Only 2 unique countries, even though there are 5 customers.

### 2.4.2 DISTINCT on Multiple Columns

When `DISTINCT` is applied to multiple columns, it deduplicates based on the **combination** of all specified columns:

```sql
-- What are the unique combinations of department and gender in employees?
SELECT DISTINCT 
    department, 
    gender 
FROM employees;
```

| department | gender |
|---|---|
| Marketing | M |
| Sales | F |
| Sales | M |

Three unique combinations. "Marketing M" appears once (even though Kevin and Frank are both in Marketing and Male — wait, let us check: Frank is Marketing/M and Kevin is Marketing/M. So there are actually two employees with Marketing/M, but DISTINCT shows it once. And Mary is Sales/F, Michael is Sales/M, Carol is Sales/F — so Sales/F appears once in the output despite two employees having it.)

### 2.4.3 Common Misconception

> ❌ **Misconception**: "`DISTINCT` removes duplicates from a single column."
> 
> ✅ **Reality**: `DISTINCT` removes duplicate **rows** based on all columns in the SELECT list. If you write `SELECT DISTINCT country, score FROM customers`, it deduplicates by the combination of (country, score), not just country.

---

## 2.5 ORDER BY

`ORDER BY` sorts the result set. Without it, **SQL makes no guarantee about row order.** The same query can return rows in a different order each time. If you need a specific order, you must explicitly sort.

### 2.5.1 Ascending Order (Default)

```sql
-- Sort customers by score, lowest first
SELECT * 
FROM customers 
ORDER BY score ASC;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 5 | Anna | Adams | USA | NULL |
| 1 | Jossef | Goldberg | Germany | 350 |
| 4 | Mark | Schwarz | Germany | 500 |
| 3 | Mary | NULL | USA | 750 |
| 2 | Kevin | Brown | USA | 900 |

> **Note**: `ASC` is the default — you can omit it. `ORDER BY score` is identical to `ORDER BY score ASC`. NULL values appear first in ascending order in MySQL.

### 2.5.2 Descending Order

```sql
-- Sort customers by score, highest first
SELECT * 
FROM customers 
ORDER BY score DESC;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |
| 1 | Jossef | Goldberg | Germany | 350 |
| 5 | Anna | Adams | USA | NULL |

NULL moves to the bottom in DESC order (MySQL default).

### 2.5.3 Sorting by Text Columns

```sql
-- Sort customers alphabetically by country
SELECT * 
FROM customers 
ORDER BY country ASC;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 4 | Mark | Schwarz | Germany | 500 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 5 | Anna | Adams | USA | NULL |

Text columns are sorted alphabetically (lexicographic order). The exact sorting rules depend on the **collation** — MySQL's `utf8mb4_unicode_ci` collation sorts case-insensitively.

### 2.5.4 Multi-Column Sorting

When you sort by multiple columns, MySQL first sorts by the first column. For rows that have the same value in the first column, it then sorts by the second column, and so on.

```sql
-- Sort by country (ascending), then by score (descending) within each country
SELECT * 
FROM customers 
ORDER BY country ASC, score DESC;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 4 | Mark | Schwarz | Germany | 500 |
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 5 | Anna | Adams | USA | NULL |

Germany comes before USA (alphabetical ASC). Within Germany, 500 comes before 350 (score DESC). Within USA, 900 → 750 → NULL (score DESC).

### 2.5.5 Sorting by Expression

You can sort by a computed value, not just by raw column:

```sql
-- Sort employees by annual salary in descending order
SELECT 
    firstname, 
    lastname, 
    salary, 
    salary * 12 AS annual_salary 
FROM employees 
ORDER BY salary * 12 DESC;
```

Or, using the alias (since ORDER BY runs after SELECT):

```sql
SELECT 
    firstname, 
    lastname, 
    salary, 
    salary * 12 AS annual_salary 
FROM employees 
ORDER BY annual_salary DESC;
```

Both produce the same result.

### 2.5.6 Sorting by Column Position

You can refer to columns by their position number (1-based) in the SELECT list:

```sql
-- Sort by the 3rd column (country) then the 4th (score)
SELECT 
    firstname, 
    lastname, 
    country, 
    score 
FROM customers 
ORDER BY 3, 4 DESC;
```

> ⚠️ **Not recommended for production code.** Column positions are fragile — if someone rearranges the SELECT list, the sort order silently changes. Use column names or aliases instead.

---

## 2.6 LIMIT and OFFSET

`LIMIT` restricts the number of rows returned. `OFFSET` skips a specified number of rows before starting to return results.

### 2.6.1 Basic LIMIT

```sql
-- Retrieve only the first 3 customers
SELECT * 
FROM customers 
LIMIT 3;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |

### 2.6.2 LIMIT with ORDER BY

`LIMIT` without `ORDER BY` gives you an arbitrary set of rows. Combine with `ORDER BY` to get the "top N":

```sql
-- Top 3 customers by score
SELECT * 
FROM customers 
ORDER BY score DESC 
LIMIT 3;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

```sql
-- Most recent 2 orders
SELECT * 
FROM orders 
ORDER BY orderdate DESC 
LIMIT 2;
```

| orderid | productid | customerid | salespersonid | orderdate | ... |
|---|---|---|---|---|---|
| 10 | 102 | 3 | 5 | 2025-03-15 | ... |
| 9 | 101 | 2 | 3 | 2025-03-10 | ... |

### 2.6.3 OFFSET for Pagination

`OFFSET` skips rows before starting to return results. Combined with `LIMIT`, this creates pagination:

```sql
-- Page 1: first 3 rows
SELECT * FROM customers ORDER BY customerid LIMIT 3 OFFSET 0;

-- Page 2: next 3 rows (skip the first 3)
SELECT * FROM customers ORDER BY customerid LIMIT 3 OFFSET 3;

-- Page 3: next 3 rows (skip the first 6) — only 2 left
SELECT * FROM customers ORDER BY customerid LIMIT 3 OFFSET 6;
```

**Shorthand syntax** (MySQL-specific):

```sql
-- LIMIT offset, count
SELECT * FROM customers ORDER BY customerid LIMIT 3, 3;
-- This is equivalent to LIMIT 3 OFFSET 3
```

> ⚠️ **Be careful with the shorthand**: `LIMIT 3, 3` means "skip 3, return 3" — the first number is the offset, the second is the count. This is the opposite of what many people expect.

### 2.6.4 MySQL vs PostgreSQL Pagination

| Syntax | MySQL | PostgreSQL |
|---|---|---|
| `LIMIT 5` | ✅ | ✅ |
| `LIMIT 5 OFFSET 10` | ✅ | ✅ |
| `LIMIT 10, 5` (shorthand) | ✅ | ❌ |
| `FETCH FIRST 5 ROWS ONLY` (SQL standard) | ✅ (MySQL 8.0+) | ✅ |
| `OFFSET 10 ROWS FETCH NEXT 5 ROWS ONLY` | ✅ (MySQL 8.0+) | ✅ |

---

## 2.7 GROUP BY

`GROUP BY` divides rows into groups based on one or more columns, then applies aggregate functions to each group.

### 2.7.1 What Aggregation Means

Without `GROUP BY`, aggregate functions operate on the entire table:

```sql
-- Total score across ALL customers
SELECT SUM(score) AS total_score 
FROM customers;
```

| total_score |
|---|
| 2500 |

With `GROUP BY`, aggregate functions operate on each group independently:

```sql
-- Total score PER COUNTRY
SELECT 
    country, 
    SUM(score) AS total_score 
FROM customers 
GROUP BY country;
```

| country | total_score |
|---|---|
| Germany | 850 |
| USA | 1650 |

### 2.7.2 The GROUP BY Rule

When you use `GROUP BY`, every column in the `SELECT` list must be either:
1. **In the GROUP BY clause**, or
2. **Inside an aggregate function** (`SUM`, `COUNT`, `AVG`, `MIN`, `MAX`)

```sql
-- ✅ Correct: country is in GROUP BY, SUM(score) is an aggregate
SELECT 
    country, 
    SUM(score) AS total_score 
FROM customers 
GROUP BY country;

-- ❌ Wrong: firstname is neither in GROUP BY nor in an aggregate
SELECT 
    country, 
    firstname,           -- This causes an error (in strict mode)
    SUM(score) AS total_score 
FROM customers 
GROUP BY country;
```

The error occurs because if you are grouping by country and Germany has two customers (Jossef and Mark), which `firstname` should MySQL display? It is ambiguous.

> **MySQL quirk**: In older MySQL versions or with `ONLY_FULL_GROUP_BY` disabled, MySQL silently picks an arbitrary value for non-grouped, non-aggregated columns. This is dangerous — it gives results that look valid but may be misleading. Modern MySQL (8.0+) has `ONLY_FULL_GROUP_BY` enabled by default and will correctly raise an error.

### 2.7.3 Multiple Aggregations

```sql
-- Per country: total score, average score, and number of customers
SELECT 
    country, 
    SUM(score) AS total_score, 
    AVG(score) AS avg_score, 
    COUNT(customerid) AS total_customers 
FROM customers 
GROUP BY country;
```

| country | total_score | avg_score | total_customers |
|---|---|---|---|
| Germany | 850 | 425.0000 | 2 |
| USA | 1650 | 825.0000 | 3 |

> **Note on NULL handling**: `SUM` and `AVG` ignore NULLs. Anna (USA) has `score = NULL`, so her score is not included in the sum or average for USA. The count is 3 because `COUNT(customerid)` counts non-NULL customerid values — Anna has a customerid, so she is counted. But if you used `COUNT(score)`, the USA count would be 2 (because Anna's score is NULL).

---

## 2.8 HAVING

`HAVING` filters groups *after* aggregation. It is to `GROUP BY` what `WHERE` is to `FROM`.

### 2.8.1 Basic HAVING

```sql
-- Find countries where the average score is greater than 430
SELECT 
    country, 
    AVG(score) AS avg_score 
FROM customers 
GROUP BY country 
HAVING AVG(score) > 430;
```

| country | avg_score |
|---|---|
| USA | 825.0000 |

Germany (avg 425) is excluded because 425 is not greater than 430.

### 2.8.2 HAVING vs WHERE — The Difference

| Aspect | WHERE | HAVING |
|---|---|---|
| **When it runs** | Before GROUP BY (filters individual rows) | After GROUP BY (filters groups) |
| **What it filters** | Individual rows | Aggregated groups |
| **Can use aggregate functions?** | ❌ No | ✅ Yes |
| **Can use raw columns?** | ✅ Yes | Only if in GROUP BY |

```sql
-- WHERE + GROUP BY + HAVING: all working together
-- Find the average score per country,
-- but only consider customers with score > 0,
-- and only show countries where the average exceeds 430
SELECT 
    country, 
    AVG(score) AS avg_score 
FROM customers 
WHERE score > 0              -- Step 1: filter out score = 0 and NULL
GROUP BY country              -- Step 2: group by country
HAVING AVG(score) > 430;      -- Step 3: keep only groups with avg > 430
```

Execution order:
1. `FROM customers` — load all 5 rows
2. `WHERE score > 0` — removes Peter (score = 0) and Anna (score = NULL). 3 rows remain.
3. `GROUP BY country` — groups into Germany (Jossef 350, Mark 500) and USA (Kevin 900, Mary 750)
4. `HAVING AVG(score) > 430` — Germany avg = 425 (excluded), USA avg = 825 (kept)
5. `SELECT` — returns the result

| country | avg_score |
|---|---|
| USA | 825.0000 |

---

## 2.9 Putting It All Together

This is the power of SQL: combining all these clauses into a single query that reads naturally.

```sql
-- Complete query:
-- Calculate the average score per country,
-- only considering customers with non-zero scores,
-- only showing countries with average above 430,
-- sorted by highest average first.
SELECT 
    country, 
    AVG(score) AS avg_score 
FROM customers 
WHERE score != 0 
GROUP BY country 
HAVING AVG(score) > 430 
ORDER BY AVG(score) DESC;
```

**Execution order**: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY

This single query demonstrates the full power of the `SELECT` statement. Every clause has a purpose, and they execute in a specific, predictable order.

---

## 2.10 Selecting Static Values

You can select values that do not come from any table:

```sql
-- Select a constant number
SELECT 123 AS static_number;
```

| static_number |
|---|
| 123 |

```sql
-- Select a constant string
SELECT 'Hello World' AS greeting;
```

| greeting |
|---|
| Hello World |

```sql
-- Add a constant column to a query
SELECT 
    customerid, 
    firstname, 
    'Active' AS status 
FROM customers;
```

| customerid | firstname | status |
|---|---|---|
| 1 | Jossef | Active |
| 2 | Kevin | Active |
| 3 | Mary | Active |
| 4 | Mark | Active |
| 5 | Anna | Active |

This is useful when you need to tag rows with a label, create placeholder values, or prepare data for UNION operations (Chapter 6).

---

## 2.11 Running Multiple Queries

You can execute multiple queries in a single script. Each must end with a semicolon:

```sql
-- Two separate queries — both execute, both produce separate result sets
SELECT * FROM customers;
SELECT * FROM orders;
```

MySQL Workbench will show two result tabs at the bottom — one for each query.

---

## Common Mistakes & Misconceptions

### Mistake 1: Using Aliases in WHERE

```sql
-- ❌ Error
SELECT firstname, score * 2 AS double_score
FROM customers
WHERE double_score > 500;
-- ERROR 1054 (42S22): Unknown column 'double_score' in 'where clause'
```

**Fix**: Use the original expression in WHERE:

```sql
-- ✅ Correct
SELECT firstname, score * 2 AS double_score
FROM customers
WHERE score * 2 > 500;
```

### Mistake 2: Non-Aggregated Columns in GROUP BY

```sql
-- ❌ Error (with ONLY_FULL_GROUP_BY enabled)
SELECT country, firstname, SUM(score) AS total
FROM customers
GROUP BY country;
-- ERROR 1055: 'firstname' is not in GROUP BY clause...
```

**Fix**: Either add `firstname` to GROUP BY, or remove it from SELECT, or wrap it in an aggregate:

```sql
-- ✅ Option 1: Add to GROUP BY
SELECT country, firstname, SUM(score) AS total
FROM customers
GROUP BY country, firstname;

-- ✅ Option 2: Remove from SELECT
SELECT country, SUM(score) AS total
FROM customers
GROUP BY country;
```

### Mistake 3: HAVING Without GROUP BY

`HAVING` without `GROUP BY` treats the entire result set as one group:

```sql
-- This works but is unusual — use WHERE instead when no grouping is needed
SELECT SUM(score) AS total
FROM customers
HAVING SUM(score) > 1000;
```

### Mistake 4: LIMIT Without ORDER BY

```sql
-- ❌ Returns 3 rows, but WHICH 3? No guarantee.
SELECT * FROM customers LIMIT 3;
```

**Fix**: Always combine LIMIT with ORDER BY unless you genuinely don't care which rows you get:

```sql
-- ✅ Returns the 3 customers with the highest scores
SELECT * FROM customers ORDER BY score DESC LIMIT 3;
```

### Mistake 5: Confusing NULL in Aggregations

```sql
-- How many customers have scores?
SELECT COUNT(score) FROM customers;   -- Returns 4 (Anna's NULL is not counted)
SELECT COUNT(*) FROM customers;        -- Returns 5 (counts ALL rows regardless of NULLs)
```

---

## Practice Exercises

### Beginner

**Exercise 2.1**: Retrieve the `firstname`, `department`, and `salary` of all employees from `salesdb`.

**Exercise 2.2**: Retrieve the `product` name and `price` from the `products` table.

**Exercise 2.3**: List all unique countries from the `customers` table.

**Exercise 2.4**: List all unique departments from the `employees` table.

**Exercise 2.5**: Retrieve all orders sorted by `orderdate` from oldest to newest.

### Intermediate

**Exercise 2.6**: Retrieve the `product`, `price`, and a new column `price_with_tax` that adds 20% to the price. Sort by `price_with_tax` descending.

**Exercise 2.7**: Find the total sales per customer. Display `customerid` and `total_sales`. Sort by total sales descending.

```sql
-- Hint: Use SUM(sales) and GROUP BY customerid on the orders table.
```

**Exercise 2.8**: Find the top 3 orders by sales amount. Display `orderid`, `customerid`, `orderdate`, and `sales`.

**Exercise 2.9**: Display the unique combinations of `orderstatus` and `productid` from the orders table. How many unique combinations are there?

**Exercise 2.10**: Calculate the average salary per department. Only include departments where the average salary exceeds 60,000. Sort by average salary descending.

### Challenge

**Exercise 2.11**: Write a single query that does ALL of the following:
- Uses the `orders` table
- Only considers orders with `quantity > 0`
- Groups by `orderstatus`
- Calculates total sales and the count of orders per status
- Only shows statuses with total sales above 50
- Sorts by total sales descending

**Exercise 2.12**: Using the `orders` table, implement pagination: show orders 4 through 6 (the "second page" with 3 orders per page) sorted by `orderdate`.

**Exercise 2.13**: Without running it, predict the output of this query and explain why:

```sql
SELECT DISTINCT country, score
FROM customers
ORDER BY score DESC;
```

How many rows does it return? Is it 2 (unique countries) or 5 (all rows)? Why?

---

## Key Takeaways

1. **`SELECT` is the reading command.** Everything you query starts here. Master it and every subsequent chapter builds on this foundation.

2. **Aliases (AS) rename output columns**, not database columns. They exist only in the result set and can only be referenced in `ORDER BY` (not `WHERE` or `GROUP BY` in standard SQL).

3. **`DISTINCT` deduplicates entire rows**, not individual columns. `SELECT DISTINCT country, score` removes rows with the same (country, score) pair.

4. **`ORDER BY` is required for deterministic row order.** Without it, the order is undefined and can change between executions.

5. **`LIMIT` + `OFFSET` = pagination.** Always pair `LIMIT` with `ORDER BY` unless you intentionally want arbitrary rows.

6. **`GROUP BY` collapses rows into groups.** Every non-aggregated column in `SELECT` must appear in `GROUP BY`.

7. **`HAVING` filters groups after aggregation.** `WHERE` filters rows before aggregation. Both can appear in the same query.

8. **NULL is invisible to most aggregate functions.** `SUM`, `AVG`, `COUNT(column)` all skip NULLs. Only `COUNT(*)` counts all rows regardless.

---

## PostgreSQL Assignment

Complete these exercises in pgAdmin 4 using the PostgreSQL `salesdb` database. Remember that the PostgreSQL version uses a `sales` schema, so tables are referenced as `sales.customers`, `sales.orders`, etc.

**PG-2.1**: Retrieve all customers sorted by score descending. Note how PostgreSQL handles NULL ordering compared to MySQL.

**PG-2.2**: Retrieve the top 3 products by price using `FETCH FIRST 3 ROWS ONLY` instead of `LIMIT`.

**PG-2.3**: Calculate the average sales per `orderstatus` using `sales.orders`. Use `HAVING` to show only statuses with an average above 30.

**PG-2.4**: Try using the MySQL shorthand `LIMIT 3, 2` in PostgreSQL. What error do you get? Rewrite it using the standard syntax.

---

## Next Chapter

→ **Chapter 3 — Data Definition (DDL)**: Now that you can read data, it is time to learn how to create the structures that hold the data — databases, tables, columns, constraints, and the relationships between them.
