# Chapter 5 — Filtering Data

---

## Chapter Overview

Every useful query filters data. A database with 10 million rows is useless if you cannot extract the 47 rows that answer your question. The `WHERE` clause is the gatekeeper — it determines which rows pass through to the result set and which are excluded.

This chapter is not just about the WHERE clause itself, but about the entire toolbox of operators and techniques that make filtering precise: comparison operators, logical operators, pattern matching, range checks, list matching, NULL handling, and the `EXISTS` operator.

### Prerequisites

- Completed Chapters 1–4
- `salesdb` and `sql_store` loaded in MySQL

### Databases Used

- `salesdb` — primary (customers, orders, employees, products)
- `sql_store` — secondary (more diverse data for practice)

```sql
USE salesdb;
```

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Filter rows using the `WHERE` clause with all comparison operators
2. Combine conditions with `AND`, `OR`, and `NOT` — understanding precedence
3. Use `BETWEEN` for range queries, including date ranges
4. Use `IN` and `NOT IN` for matching against lists
5. Use `LIKE` and `REGEXP` for pattern matching
6. Handle `NULL` correctly with `IS NULL`, `IS NOT NULL`, and the three-valued logic model
7. Use `EXISTS` for correlated existence checks
8. Build complex, readable multi-condition filters

---

## 5.1 The WHERE Clause

`WHERE` appears after `FROM` and filters **individual rows** before any grouping, aggregation, or sorting occurs.

```sql
-- Retrieve only customers from Germany
SELECT *
FROM customers
WHERE country = 'Germany';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 4 | Mark | Schwarz | Germany | 500 |

Execution: MySQL loads all 5 customers (FROM), then tests each row against `country = 'Germany'`. Only rows where the condition is TRUE pass through.

---

## 5.2 Comparison Operators

| Operator | Meaning | Example |
|---|---|---|
| `=` | Equal to | `WHERE score = 500` |
| `!=` or `<>` | Not equal to | `WHERE country != 'USA'` |
| `>` | Greater than | `WHERE salary > 60000` |
| `<` | Less than | `WHERE price < 20` |
| `>=` | Greater than or equal | `WHERE score >= 500` |
| `<=` | Less than or equal | `WHERE quantity <= 2` |

### 5.2.1 Numeric Comparisons

```sql
-- Employees earning more than 60,000
SELECT firstname, lastname, salary
FROM employees
WHERE salary > 60000;
```

| firstname | lastname | salary |
|---|---|---|
| Kevin | Brown | 65000 |
| Mary | NULL | 75000 |
| Michael | Ray | 90000 |

### 5.2.2 String Comparisons

```sql
-- Customers whose first name is NOT 'Kevin'
SELECT firstname, country
FROM customers
WHERE firstname != 'Kevin';
```

| firstname | country |
|---|---|
| Jossef | Germany |
| Mary | USA |
| Mark | Germany |
| Anna | USA |

> **String comparison is case-insensitive by default in MySQL** (because `utf8mb4_unicode_ci` collation). `WHERE country = 'usa'` will match 'USA'. In **PostgreSQL**, string comparison is case-sensitive by default.

### 5.2.3 Date Comparisons

Dates can be compared with `=`, `>`, `<`, `>=`, `<=`:

```sql
-- Orders placed after February 1st, 2025
SELECT orderid, orderdate, orderstatus
FROM orders
WHERE orderdate > '2025-02-01';
```

| orderid | orderdate | orderstatus |
|---|---|---|
| 5 | 2025-02-01 | Delivered |
| 6 | 2025-02-05 | Delivered |
| 7 | 2025-02-15 | Delivered |
| 8 | 2025-02-18 | Shipped |
| 9 | 2025-03-10 | Shipped |
| 10 | 2025-03-15 | Shipped |

> Wait — order 5 has `orderdate = '2025-02-01'` and our condition is `> '2025-02-01'`. Since `>` is strict greater-than, `2025-02-01` is NOT greater than itself. If we wanted to include it: use `>= '2025-02-01'`.

---

## 5.3 Logical Operators: AND, OR, NOT

### 5.3.1 AND — All Conditions Must Be True

```sql
-- Customers from USA with a score above 700
SELECT *
FROM customers
WHERE country = 'USA' AND score > 700;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |

Both conditions must be satisfied for a row to appear.

### 5.3.2 OR — At Least One Condition Must Be True

```sql
-- Customers from Germany OR with a score above 700
SELECT *
FROM customers
WHERE country = 'Germany' OR score > 700;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

Jossef (Germany, score 350) passes because the country condition is true.
Kevin (USA, score 900) passes because the score condition is true.

### 5.3.3 NOT — Negates a Condition

```sql
-- Customers who are NOT from the USA
SELECT *
FROM customers
WHERE NOT country = 'USA';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 4 | Mark | Schwarz | Germany | 500 |

### 5.3.4 Operator Precedence — Why Parentheses Matter

**`AND` has higher precedence than `OR`.** This means:

```sql
-- What does this actually do?
SELECT *
FROM customers
WHERE country = 'Germany' OR country = 'USA' AND score > 700;
```

This is evaluated as:

```sql
WHERE country = 'Germany' OR (country = 'USA' AND score > 700)
```

NOT as:

```sql
WHERE (country = 'Germany' OR country = 'USA') AND score > 700
```

**Result without parentheses** (AND binds tighter):

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

ALL German customers pass (regardless of score), plus USA customers with score > 700.

**Result with explicit parentheses** (if we meant "Germany or USA, and score > 700"):

```sql
WHERE (country = 'Germany' OR country = 'USA') AND score > 700
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |

Only 2 rows — because now the score filter applies to everyone.

> **Rule**: Always use parentheses when mixing AND and OR. Do not rely on precedence — explicit grouping is clearer and safer.

---

## 5.4 BETWEEN

`BETWEEN` checks if a value falls within a range. It is **inclusive on both ends**.

### 5.4.1 Numeric BETWEEN

```sql
-- Customers with scores between 400 and 800
SELECT *
FROM customers
WHERE score BETWEEN 400 AND 800;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

Equivalent to:

```sql
WHERE score >= 400 AND score <= 800
```

### 5.4.2 Date BETWEEN

```sql
-- Orders placed in January 2025
SELECT orderid, orderdate, sales
FROM orders
WHERE orderdate BETWEEN '2025-01-01' AND '2025-01-31';
```

| orderid | orderdate | sales |
|---|---|---|
| 1 | 2025-01-01 | 10 |
| 2 | 2025-01-05 | 15 |
| 3 | 2025-01-10 | 20 |
| 4 | 2025-01-20 | 60 |

> ⚠️ **Date BETWEEN gotcha**: If your column is `DATETIME` or `TIMESTAMP` (not just `DATE`), `BETWEEN '2025-01-01' AND '2025-01-31'` means `BETWEEN '2025-01-01 00:00:00' AND '2025-01-31 00:00:00'`. A record at `2025-01-31 15:30:00` would be **excluded**. For DATETIME columns, use: `BETWEEN '2025-01-01' AND '2025-01-31 23:59:59'` or better: `WHERE orderdate >= '2025-01-01' AND orderdate < '2025-02-01'`.

### 5.4.3 NOT BETWEEN

```sql
-- Employees with salary outside the 55000–70000 range
SELECT firstname, salary
FROM employees
WHERE salary NOT BETWEEN 55000 AND 70000;
```

| firstname | salary |
|---|---|
| Mary | 75000 |
| Michael | 90000 |

---

## 5.5 IN and NOT IN

`IN` checks if a value matches any value in a list. It is a cleaner alternative to multiple OR conditions.

### 5.5.1 Basic IN

```sql
-- Customers from Germany or USA
SELECT *
FROM customers
WHERE country IN ('Germany', 'USA');
```

This is equivalent to:

```sql
WHERE country = 'Germany' OR country = 'USA'
```

But `IN` is shorter, cleaner, and more readable — especially with longer lists.

### 5.5.2 IN with Numbers

```sql
-- Orders for products 101 or 104
SELECT orderid, productid, sales
FROM orders
WHERE productid IN (101, 104);
```

| orderid | productid | sales |
|---|---|---|
| 1 | 101 | 10 |
| 3 | 101 | 20 |
| 5 | 104 | 25 |
| 6 | 104 | 50 |
| 8 | 101 | 90 |
| 9 | 101 | 20 |

### 5.5.3 NOT IN

```sql
-- Customers NOT from Germany or USA
SELECT *
FROM customers
WHERE country NOT IN ('Germany', 'USA');
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|

Empty result — all our customers are from Germany or USA.

### 5.5.4 IN with Subquery

`IN` can take a subquery instead of a hardcoded list:

```sql
-- Find customers who have placed at least one order
SELECT *
FROM customers
WHERE customerid IN (
    SELECT DISTINCT customerid 
    FROM orders
);
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

Customer 5 (Anna) has no orders, so she is excluded.

### 5.5.5 The NOT IN / NULL Trap

> ❌ **CRITICAL**: `NOT IN` behaves unexpectedly when the list contains NULL.

```sql
-- Find customers whose score is NOT in this list
SELECT *
FROM customers
WHERE score NOT IN (350, 500, NULL);
```

**Expected**: Kevin (900) and Mary (750).  
**Actual**: **No rows returned.**

**Why?** Because `NOT IN` is logically equivalent to `score != 350 AND score != 500 AND score != NULL`. The last condition `score != NULL` evaluates to **UNKNOWN** (not TRUE or FALSE). Any AND with UNKNOWN produces UNKNOWN, so no rows pass.

**Fix**: Filter NULLs out of your NOT IN list, or use `NOT EXISTS` instead:

```sql
-- ✅ Safe alternative
SELECT *
FROM customers
WHERE score NOT IN (350, 500)
  AND score IS NOT NULL;
```

---

## 5.6 LIKE — Pattern Matching

`LIKE` compares a string against a pattern using two wildcard characters:

| Wildcard | Meaning | Example |
|---|---|---|
| `%` | Any sequence of characters (including none) | `'M%'` matches 'Mary', 'Mark', 'Michael' |
| `_` | Any single character | `'M_ry'` matches 'Mary', 'Mory', but not 'Marry' |

### 5.6.1 Starts With

```sql
-- Customers whose first name starts with 'M'
SELECT *
FROM customers
WHERE firstname LIKE 'M%';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

### 5.6.2 Ends With

```sql
-- Customers whose first name ends with 'n'
SELECT *
FROM customers
WHERE firstname LIKE '%n';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 2 | Kevin | Brown | USA | 900 |

### 5.6.3 Contains

```sql
-- Customers whose first name contains 'ar'
SELECT *
FROM customers
WHERE firstname LIKE '%ar%';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

### 5.6.4 Underscore Wildcard — Exact Position

```sql
-- Customers whose first name has exactly 4 characters
SELECT *
FROM customers
WHERE firstname LIKE '____';  -- four underscores
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |
| 5 | Anna | Adams | USA | NULL |

### 5.6.5 NOT LIKE

```sql
-- Customers whose name does NOT start with 'M'
SELECT *
FROM customers
WHERE firstname NOT LIKE 'M%';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 5 | Anna | Adams | USA | NULL |

### 5.6.6 Case Sensitivity

| Engine | LIKE Behaviour |
|---|---|
| **MySQL** | Case-**insensitive** by default (depends on collation). `WHERE name LIKE 'mary'` matches 'Mary'. |
| **PostgreSQL** | Case-**sensitive** by default. `WHERE name LIKE 'mary'` does NOT match 'Mary'. Use `ILIKE` for case-insensitive: `WHERE name ILIKE 'mary'` |

---

## 5.7 REGEXP — Regular Expressions

When LIKE is not powerful enough, MySQL offers `REGEXP` (regular expression matching) for advanced pattern matching.

```sql
-- Customers whose first name starts with 'J' or 'K'
SELECT *
FROM customers
WHERE firstname REGEXP '^[JK]';
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |

### Common REGEXP Patterns

| Pattern | Meaning | Example |
|---|---|---|
| `^abc` | Starts with 'abc' | `'^Mar'` matches 'Mary', 'Mark' |
| `abc$` | Ends with 'abc' | `'son$'` matches 'Johnson' |
| `[abc]` | Any character in the set | `'^[JKM]'` matches names starting with J, K, or M |
| `[a-z]` | Any character in range | `'[0-9]'` matches any digit |
| `.` | Any single character | `'M.r.'` matches 'Mary', 'Mark' |
| `\|` | OR | `'Mary\|Kevin'` matches either |
| `{n}` | Exactly n occurrences | `'s{2}'` matches 'ss' |

```sql
-- Employees whose last name ends with 'er' or 'ee'
SELECT firstname, lastname
FROM employees
WHERE lastname REGEXP '(er|ee)$';
```

| firstname | lastname |
|---|---|
| Carol | Baker |

> **PostgreSQL equivalent**: Use the `~` operator for case-sensitive regex and `~*` for case-insensitive:
> ```sql
> WHERE firstname ~ '^[JK]'     -- case-sensitive
> WHERE firstname ~* '^[jk]'    -- case-insensitive
> ```

---

## 5.8 IS NULL / IS NOT NULL

NULL is not a value — it is the **absence of a value**. It cannot be compared with `=`, `!=`, `>`, `<`, or any standard operator.

### 5.8.1 Why `= NULL` Does Not Work

```sql
-- ❌ This returns NO rows, even though Mary's lastname IS null
SELECT *
FROM customers
WHERE lastname = NULL;
-- Empty result set
```

**Why?** In SQL's three-valued logic, any comparison with NULL returns **UNKNOWN** — not TRUE, not FALSE. `NULL = NULL` is UNKNOWN. `NULL != NULL` is UNKNOWN. Only `IS NULL` evaluates to TRUE.

### 5.8.2 IS NULL

```sql
-- ✅ Correct: Find customers with no last name
SELECT *
FROM customers
WHERE lastname IS NULL;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 3 | Mary | NULL | USA | 750 |

### 5.8.3 IS NOT NULL

```sql
-- Customers who HAVE a score
SELECT *
FROM customers
WHERE score IS NOT NULL;
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

Anna (score IS NULL) is excluded.

### 5.8.4 NULL in Compound Conditions

NULL's three-valued logic interacts with AND and OR in ways that catch people off guard:

| Expression | Result |
|---|---|
| `TRUE AND NULL` | UNKNOWN |
| `FALSE AND NULL` | FALSE |
| `TRUE OR NULL` | TRUE |
| `FALSE OR NULL` | UNKNOWN |
| `NOT NULL` | UNKNOWN |

Practical impact:

```sql
-- Does this include Anna (score = NULL)?
SELECT *
FROM customers
WHERE score > 300 OR country = 'USA';
```

For Anna: `NULL > 300` → UNKNOWN; `'USA' = 'USA'` → TRUE. `UNKNOWN OR TRUE` → **TRUE**. Anna IS included because the country condition saves her.

```sql
-- Does this include Anna?
SELECT *
FROM customers
WHERE score > 300 AND country = 'USA';
```

For Anna: `NULL > 300` → UNKNOWN; `'USA' = 'USA'` → TRUE. `UNKNOWN AND TRUE` → **UNKNOWN**. Anna is **excluded** because UNKNOWN is not TRUE.

---

## 5.9 EXISTS

`EXISTS` checks whether a subquery returns **any rows at all**. It does not care about the values — only whether the result set is empty or not.

### 5.9.1 Basic EXISTS

```sql
-- Find customers who have placed at least one order
SELECT *
FROM customers c
WHERE EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.customerid = c.customerid
);
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 1 | Jossef | Goldberg | Germany | 350 |
| 2 | Kevin | Brown | USA | 900 |
| 3 | Mary | NULL | USA | 750 |
| 4 | Mark | Schwarz | Germany | 500 |

Anna (customerid = 5) has no orders, so she is excluded.

### 5.9.2 NOT EXISTS

```sql
-- Find customers who have NEVER placed an order
SELECT *
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.customerid = c.customerid
);
```

| customerid | firstname | lastname | country | score |
|---|---|---|---|---|
| 5 | Anna | Adams | USA | NULL |

### 5.9.3 EXISTS vs IN — When to Use Each

| Aspect | `IN` | `EXISTS` |
|---|---|---|
| Syntax | Simpler | More verbose (requires correlated subquery) |
| NULL handling | Dangerous with `NOT IN` + NULLs | Safe — NULLs do not cause issues |
| Performance (large outer, small inner) | Often faster | May be slower |
| Performance (small outer, large inner) | May be slower | Often faster (stops at first match) |
| Readability | Better for static lists | Better for correlated checks |

> **Rule of thumb**: Use `IN` for simple lists and when you are confident there are no NULLs. Use `EXISTS` for correlated subqueries and when NULLs might be present.

---

## 5.10 Building Complex Filters

Real-world queries often combine many conditions. The key is readability:

```sql
-- Find delivered orders from January 2025 for clothing products
-- placed by customers with a score above 500
SELECT 
    o.orderid,
    c.firstname,
    p.product,
    o.orderdate,
    o.sales
FROM orders o
JOIN customers c ON o.customerid = c.customerid
JOIN products p ON o.productid = p.productid
WHERE o.orderstatus = 'Delivered'
  AND o.orderdate BETWEEN '2025-01-01' AND '2025-01-31'
  AND p.category = 'Clothing'
  AND c.score > 500;
```

> **Formatting tip**: Align your AND/OR operators vertically on the left side. This makes it easy to scan which conditions are applied. Each condition on its own line.

---

## Common Mistakes & Misconceptions

### Mistake 1: Using `= NULL` Instead of `IS NULL`

```sql
-- ❌ Always returns empty result
SELECT * FROM customers WHERE lastname = NULL;

-- ✅ Correct
SELECT * FROM customers WHERE lastname IS NULL;
```

### Mistake 2: Forgetting Parentheses with Mixed AND/OR

```sql
-- ❌ Probably not what you intended
WHERE department = 'Sales' OR department = 'Marketing' AND salary > 60000

-- ✅ Make your intent explicit
WHERE (department = 'Sales' OR department = 'Marketing') AND salary > 60000
```

### Mistake 3: NOT IN with NULLs

```sql
-- ❌ Returns NO rows because the subquery result contains NULLs
WHERE score NOT IN (SELECT score FROM some_table)

-- ✅ Filter NULLs from the subquery
WHERE score NOT IN (SELECT score FROM some_table WHERE score IS NOT NULL)

-- ✅ Or use NOT EXISTS
WHERE NOT EXISTS (SELECT 1 FROM some_table s WHERE s.score = customers.score)
```

### Mistake 4: Case-Sensitive LIKE in PostgreSQL

```sql
-- In MySQL: matches 'mary', 'Mary', 'MARY'
WHERE firstname LIKE 'mary'

-- In PostgreSQL: matches ONLY 'mary'
-- Use ILIKE for case-insensitive:
WHERE firstname ILIKE 'mary'
```

### Mistake 5: BETWEEN with Wrong Date Types

```sql
-- ❌ Misses records on Jan 31 after midnight if column is DATETIME
WHERE orderdate BETWEEN '2025-01-01' AND '2025-01-31'

-- ✅ Correct for DATETIME columns
WHERE orderdate >= '2025-01-01' AND orderdate < '2025-02-01'
```

---

## Practice Exercises

### Beginner

**Exercise 5.1**: Find all employees in the Sales department.

**Exercise 5.2**: Find all products with a price of 20 or more.

**Exercise 5.3**: Find all customers whose last name is NULL.

**Exercise 5.4**: Find all orders with a status of 'Shipped'.

**Exercise 5.5**: Find all customers whose first name starts with 'A'.

### Intermediate

**Exercise 5.6**: Find all orders placed in February 2025 with sales greater than 25.

**Exercise 5.7**: Find employees who are in the Marketing department OR have a salary above 80,000.

**Exercise 5.8**: Find customers whose country is in ('Germany', 'USA') AND whose score is NOT NULL and is BETWEEN 400 AND 900.

**Exercise 5.9**: Using the `sql_store` database, find all customers whose phone number is NOT NULL and whose city is NOT 'Nashville'. (Hint: `USE sql_store;`)

**Exercise 5.10**: Find orders where the `billaddress` is NULL or an empty string ('').

### Challenge

**Exercise 5.11**: Using `EXISTS`, find all products that have been ordered at least once. Then rewrite the same query using `IN`. Compare the results.

**Exercise 5.12**: Using the `salesdb`, find all employees whose names match the pattern: first name has exactly 5 characters AND last name starts with a letter in the range B–L.

**Exercise 5.13**: Write a query that finds orders where:
- The order status is 'Shipped' OR 'Delivered'
- AND the quantity is greater than 1
- AND the ship address is NOT NULL
- AND the order was placed after January 15, 2025
Sort by sales descending.

**Exercise 5.14**: Explain in writing (without running) what this query returns and why:
```sql
SELECT * FROM customers WHERE NOT (country = 'USA' AND score IS NOT NULL);
```
Apply De Morgan's Law to rewrite the condition without NOT.

---

## Key Takeaways

1. **WHERE filters individual rows** based on conditions. It executes before GROUP BY, HAVING, SELECT, and ORDER BY.

2. **Comparison operators** (`=`, `!=`, `>`, `<`, `>=`, `<=`) work on numbers, strings, and dates. String comparison is case-insensitive in MySQL by default.

3. **AND has higher precedence than OR.** Always use parentheses when combining them to make your intent explicit.

4. **BETWEEN is inclusive on both ends.** Be careful with DATETIME columns — `BETWEEN '2025-01-01' AND '2025-01-31'` may miss records after midnight on Jan 31.

5. **IN is cleaner than multiple OR conditions.** But `NOT IN` is dangerous when the list contains NULLs — it silently returns no rows. Use `NOT EXISTS` as a safe alternative.

6. **LIKE uses `%` (any characters) and `_` (one character).** MySQL LIKE is case-insensitive; PostgreSQL LIKE is case-sensitive (use `ILIKE`).

7. **NULL is not a value — it is the absence of a value.** You cannot compare to NULL with `=`. Use `IS NULL` and `IS NOT NULL`. Every comparison with NULL returns UNKNOWN, which is neither TRUE nor FALSE.

8. **EXISTS checks for the existence of rows** in a subquery. It is NULL-safe and often outperforms `IN` for correlated subqueries.

---

## PostgreSQL Assignment

**PG-5.1**: In the PostgreSQL `salesdb`, find all orders with a status of 'Delivered' using `sales.orders`.

**PG-5.2**: Try `WHERE firstname LIKE 'k%'` on `sales.customers` in PostgreSQL. Does it match 'Kevin'? Now try `ILIKE 'k%'`. Explain the difference.

**PG-5.3**: PostgreSQL has a `SIMILAR TO` operator that combines LIKE and REGEXP features. Research and write a query using it.

**PG-5.4**: Use PostgreSQL's `IS DISTINCT FROM` operator to compare two values where one might be NULL. Write: `WHERE lastname IS DISTINCT FROM 'Brown'` and compare the result to `WHERE lastname != 'Brown'`. What row appears in one but not the other?

---

## Next Chapter

→ **Chapter 6 — Combining Data**: Filtering is powerful on one table. But real insights come from connecting multiple tables. Joins are how you do that — and they are the most important SQL concept you will learn after SELECT.
