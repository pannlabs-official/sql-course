# Chapter 6 - Combining Data

---

## Chapter Overview

Until now, every query has pulled data from a single table. But databases are relational - data is deliberately split across multiple tables to eliminate redundancy. To answer real business questions, you need to **combine** data from different tables.

This chapter covers two mechanisms for combining data:
1. **JOINs** - connect rows from different tables based on a shared column
2. **Set Operations** - stack or compare result sets from different queries (UNION, INTERSECT, EXCEPT)

JOINs are the single most important SQL concept after SELECT. If you master JOINs, you can query virtually any relational database.

### Prerequisites

- Completed Chapters 1–5
- `salesdb`, `sql_store`, `sql_hr`, and `sql_invoicing` loaded

### Databases Used

- `salesdb` - primary (multi-table JOINs across customers/orders/products/employees)
- `sql_hr` - self-JOIN exercises (employee → manager hierarchy)
- `sql_store` - complex multi-table JOINs
- `sql_invoicing` - financial data JOINs

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Explain why JOINs are necessary in normalised databases
2. Write `INNER JOIN` queries connecting two or more tables
3. Use `LEFT JOIN` and `RIGHT JOIN` to preserve non-matching rows
4. Simulate `FULL OUTER JOIN` in MySQL
5. Use `CROSS JOIN` for Cartesian products
6. Write `SELF JOIN` queries for hierarchical data
7. Chain JOINs across 3, 4, or more tables
8. Choose between `ON` and `USING` for join conditions
9. Combine result sets with `UNION`, `UNION ALL`, `INTERSECT`, and `EXCEPT`

---

## 6.1 Why JOINs Exist

In the `salesdb`, order `1` has `customerid = 2` and `productid = 101`. But what is customer 2's name? What is product 101?

```sql
USE salesdb;
SELECT * FROM orders WHERE orderid = 1;
```

| orderid | productid | customerid | salespersonid | orderdate | ... |
|---|---|---|---|---|---|
| 1 | 101 | 2 | 3 | 2025-01-01 | ... |

The orders table stores IDs, not names. To get names, you need to look them up in the `customers` and `products` tables. That lookup is a JOIN.

---

## 6.2 INNER JOIN

An `INNER JOIN` returns **only rows where a match exists in both tables**. Non-matching rows from either side are excluded.

### 6.2.1 Basic Two-Table JOIN

```sql
-- Get order details with customer names
SELECT 
    o.orderid,
    c.firstname,
    c.lastname,
    o.orderdate,
    o.sales
FROM orders o
INNER JOIN customers c ON o.customerid = c.customerid;
```

| orderid | firstname | lastname | orderdate | sales |
|---|---|---|---|---|
| 1 | Kevin | Brown | 2025-01-01 | 10 |
| 2 | Mary | NULL | 2025-01-05 | 15 |
| 3 | Jossef | Goldberg | 2025-01-10 | 20 |
| 4 | Jossef | Goldberg | 2025-01-20 | 60 |
| 5 | Kevin | Brown | 2025-02-01 | 25 |
| 6 | Mary | NULL | 2025-02-05 | 50 |
| 7 | Jossef | Goldberg | 2025-02-15 | 30 |
| 8 | Mark | Schwarz | 2025-02-18 | 90 |
| 9 | Kevin | Brown | 2025-03-10 | 20 |
| 10 | Mary | NULL | 2025-03-15 | 60 |

**Anatomy of this JOIN**:
- `orders o` - the left table (aliased as `o`)
- `INNER JOIN customers c` - the right table (aliased as `c`)
- `ON o.customerid = c.customerid` - the join condition (how to match rows)
- Table aliases (`o`, `c`) prevent ambiguity and keep the query concise

### 6.2.2 Adding Product Information

```sql
-- Orders with customer names AND product names
SELECT 
    o.orderid,
    c.firstname AS customer,
    p.product,
    p.category,
    o.sales
FROM orders o
INNER JOIN customers c ON o.customerid = c.customerid
INNER JOIN products p ON o.productid = p.productid;
```

| orderid | customer | product | category | sales |
|---|---|---|---|---|
| 1 | Kevin | Bottle | Accessories | 10 |
| 2 | Mary | Tire | Accessories | 15 |
| 3 | Jossef | Bottle | Accessories | 20 |
| 4 | Jossef | Gloves | Clothing | 60 |
| 5 | Kevin | Caps | Clothing | 25 |
| 6 | Mary | Caps | Clothing | 50 |
| 7 | Jossef | Tire | Accessories | 30 |
| 8 | Mark | Bottle | Accessories | 90 |
| 9 | Kevin | Bottle | Accessories | 20 |
| 10 | Mary | Tire | Accessories | 60 |

We are now querying across 3 tables in a single statement. This is the power of JOINs.

### 6.2.3 Four-Table JOIN - Full Order Details

```sql
-- Complete order report: customer, product, and salesperson
SELECT 
    o.orderid,
    o.orderdate,
    c.firstname AS customer,
    c.country,
    p.product,
    p.category,
    e.firstname AS salesperson,
    o.quantity,
    o.sales
FROM orders o
INNER JOIN customers c ON o.customerid = c.customerid
INNER JOIN products p ON o.productid = p.productid
INNER JOIN employees e ON o.salespersonid = e.employeeid;
```

| orderid | orderdate | customer | country | product | category | salesperson | quantity | sales |
|---|---|---|---|---|---|---|---|---|
| 1 | 2025-01-01 | Kevin | USA | Bottle | Accessories | Mary | 1 | 10 |
| 2 | 2025-01-05 | Mary | USA | Tire | Accessories | Mary | 1 | 15 |
| 3 | 2025-01-10 | Jossef | Germany | Bottle | Accessories | Carol | 2 | 20 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

Four tables, one query. Each JOIN adds a new dimension of information.

---

## 6.3 LEFT JOIN (LEFT OUTER JOIN)

A `LEFT JOIN` returns **all rows from the left table**, even if there is no match in the right table. Non-matching columns from the right table are filled with NULL.

### 6.3.1 Finding Customers Without Orders

```sql
-- All customers, whether they have orders or not
SELECT 
    c.customerid,
    c.firstname,
    o.orderid,
    o.sales
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid;
```

| customerid | firstname | orderid | sales |
|---|---|---|---|
| 1 | Jossef | 3 | 20 |
| 1 | Jossef | 4 | 60 |
| 1 | Jossef | 7 | 30 |
| 2 | Kevin | 1 | 10 |
| 2 | Kevin | 5 | 25 |
| 2 | Kevin | 9 | 20 |
| 3 | Mary | 2 | 15 |
| 3 | Mary | 6 | 50 |
| 3 | Mary | 10 | 60 |
| 4 | Mark | 8 | 90 |
| **5** | **Anna** | **NULL** | **NULL** |

Anna (customerid 5) has no orders. An INNER JOIN would exclude her entirely. A LEFT JOIN keeps her and fills the order columns with NULL.

### 6.3.2 Isolating Non-Matching Rows

A common pattern: find rows in the left table that have NO match in the right table:

```sql
-- Find customers who have NEVER placed an order
SELECT 
    c.customerid,
    c.firstname,
    c.lastname
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
WHERE o.orderid IS NULL;
```

| customerid | firstname | lastname |
|---|---|---|
| 5 | Anna | Adams |

The `WHERE o.orderid IS NULL` keeps only the rows where the LEFT JOIN found no match.

---

## 6.4 RIGHT JOIN (RIGHT OUTER JOIN)

A `RIGHT JOIN` is the mirror of LEFT JOIN - it keeps **all rows from the right table**, filling non-matching left table columns with NULL.

```sql
-- All orders, including those for customers not in the customers table
SELECT 
    c.firstname,
    o.orderid,
    o.sales
FROM customers c
RIGHT JOIN orders o ON c.customerid = o.customerid;
```

In our data, every order has a valid customerid, so this produces the same result as INNER JOIN. Right JOINs are rarely used in practice - you can always rewrite them as LEFT JOINs by swapping the table order.

> **Convention**: Prefer LEFT JOIN over RIGHT JOIN. It reads more naturally (start with the "main" table on the left) and is the industry standard.

---

## 6.5 FULL OUTER JOIN

A `FULL OUTER JOIN` keeps **all rows from both tables**, filling NULLs where there is no match on either side.

> ⚠️ **MySQL does not support FULL OUTER JOIN directly.** You must simulate it with a UNION of LEFT and RIGHT JOINs:

```sql
-- MySQL workaround for FULL OUTER JOIN
SELECT c.customerid, c.firstname, o.orderid, o.sales
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid

UNION

SELECT c.customerid, c.firstname, o.orderid, o.sales
FROM customers c
RIGHT JOIN orders o ON c.customerid = o.customerid;
```

> **PostgreSQL supports FULL OUTER JOIN natively:**
> ```sql
> SELECT c.customerid, c.firstname, o.orderid, o.sales
> FROM sales.customers c
> FULL OUTER JOIN sales.orders o ON c.customerid = o.customerid;
> ```

---

## 6.6 CROSS JOIN

A `CROSS JOIN` produces the **Cartesian product** - every row from the left table paired with every row from the right table. No join condition is needed.

```sql
-- Every customer paired with every product
SELECT 
    c.firstname,
    p.product,
    p.price
FROM customers c
CROSS JOIN products p;
```

This produces 5 customers × 5 products = **25 rows**.

| firstname | product | price |
|---|---|---|
| Jossef | Bottle | 10 |
| Jossef | Tire | 15 |
| Jossef | Socks | 20 |
| ... | ... | ... |
| Anna | Gloves | 30 |

**When is CROSS JOIN useful?**
- Generating all possible combinations (size × color for a product catalog)
- Creating date scaffolds (every date × every product for time-series reports)
- Generating test data

> ⚠️ **Cartesian products grow fast.** 1,000 × 1,000 = 1,000,000 rows. Be careful with large tables.

---

## 6.7 SELF JOIN

A self JOIN joins a table **to itself**. This is essential for hierarchical or recursive data - like the employee/manager relationship in our `employees` table.

### 6.7.1 Employee-Manager Hierarchy

The `employees` table has a `managerid` column that references `employeeid` in the same table:

```sql
-- Find each employee and their manager's name
SELECT 
    e.firstname AS employee,
    e.lastname AS employee_lastname,
    m.firstname AS manager
FROM employees e
LEFT JOIN employees m ON e.managerid = m.employeeid;
```

| employee | employee_lastname | manager |
|---|---|---|
| Frank | Lee | NULL |
| Kevin | Brown | Frank |
| Mary | NULL | Frank |
| Michael | Ray | Kevin |
| Carol | Baker | Mary |

Frank has no manager (NULL) - he is at the top. Kevin reports to Frank, Mary reports to Frank, Michael reports to Kevin, and Carol reports to Mary.

> **Why LEFT JOIN?** Because Frank's `managerid` is NULL. An INNER JOIN would exclude him since there is no matching manager.

### 6.7.2 Self JOIN in sql_hr

The `sql_hr.employees` table also has a `reports_to` column:

```sql
USE sql_hr;

SELECT 
    e.first_name AS employee,
    e.job_title,
    m.first_name AS manager
FROM employees e
LEFT JOIN employees m ON e.reports_to = m.employee_id;
```

| employee | job_title | manager |
|---|---|---|
| Yovonnda | Executive Secretary | NULL |
| D'arcy | Account Executive | Yovonnda |
| Sayer | Statistician III | Yovonnda |
| Mindy | Staff Scientist | Yovonnda |
| ... | ... | Yovonnda |

All 19 employees report to Yovonnda (employee_id = 37270).

---

## 6.8 ON vs USING

Both specify the join condition, but they work differently:

### `ON` - Full Control

```sql
SELECT *
FROM orders o
INNER JOIN customers c ON o.customerid = c.customerid;
```

`ON` allows any condition - the column names do not need to match:

```sql
-- Join on differently-named columns
FROM orders o
INNER JOIN employees e ON o.salespersonid = e.employeeid
```

### `USING` - Shorthand for Same-Named Columns

When both tables have a column with the **exact same name**, you can use `USING`:

```sql
SELECT *
FROM orders
INNER JOIN customers USING (customerid);
```

This is equivalent to `ON orders.customerid = customers.customerid`, but shorter.

> **Rule**: Use `USING` when columns share the exact same name and there is only one join condition. Use `ON` for everything else.

---

## 6.9 Set Operations: UNION, INTERSECT, EXCEPT

Set operations combine the **results** of two separate queries (not the tables themselves).

### 6.9.1 UNION - Combine and Deduplicate

`UNION` stacks two result sets vertically and removes duplicates:

```sql
USE salesdb;

-- Combine orders and archived orders
SELECT orderid, customerid, orderdate, sales 
FROM orders
UNION
SELECT orderid, customerid, orderdate, sales 
FROM orders_archive;
```

**Rules**:
- Both queries must have the **same number of columns**
- Corresponding columns should have **compatible data types**
- Column names come from the **first** query
- **Duplicates are removed** (if a row appears in both result sets, it appears once in the output)

### 6.9.2 UNION ALL - Combine Without Deduplication

`UNION ALL` keeps all rows, including duplicates. It is faster than `UNION` because it does not need to check for duplicates:

```sql
SELECT orderid, customerid, orderdate, sales 
FROM orders
UNION ALL
SELECT orderid, customerid, orderdate, sales 
FROM orders_archive;
```

This returns all 20 rows (10 + 10), even if some are identical.

> **Performance tip**: Use `UNION ALL` whenever you know there are no duplicates or when duplicates are acceptable. It is significantly faster on large datasets.

### 6.9.3 UNION with Different Tables

```sql
-- Combine customer names and employee names into a single list
SELECT firstname, lastname, 'Customer' AS source FROM customers
UNION
SELECT firstname, lastname, 'Employee' AS source FROM employees;
```

| firstname | lastname | source |
|---|---|---|
| Jossef | Goldberg | Customer |
| Kevin | Brown | Customer |
| Mary | NULL | Customer |
| Mark | Schwarz | Customer |
| Anna | Adams | Customer |
| Frank | Lee | Employee |
| Kevin | Brown | Employee |
| Michael | Ray | Employee |
| Carol | Baker | Employee |

Notice: Kevin Brown appears twice - once as Customer, once as Employee. They are not duplicates because the `source` column differs.

### 6.9.4 INTERSECT - Common Rows Only

`INTERSECT` returns only rows that appear in **both** result sets.

> ⚠️ **MySQL 8.0.31+ supports INTERSECT.** Older versions do not. Use an INNER JOIN as a workaround.

```sql
-- Find customer names that are also employee names
SELECT firstname FROM customers
INTERSECT
SELECT firstname FROM employees;
```

| firstname |
|---|
| Kevin |
| Mary |

Both Kevin and Mary exist in both tables.

**MySQL workaround (for older versions)**:

```sql
SELECT DISTINCT c.firstname
FROM customers c
INNER JOIN employees e ON c.firstname = e.firstname;
```

### 6.9.5 EXCEPT - Rows in First But Not Second

`EXCEPT` returns rows from the first query that do **not** appear in the second.

> ⚠️ **MySQL 8.0.31+ supports EXCEPT.** Older versions do not.

```sql
-- Find customer names that are NOT employee names
SELECT firstname FROM customers
EXCEPT
SELECT firstname FROM employees;
```

| firstname |
|---|
| Jossef |
| Mark |
| Anna |

**MySQL workaround (for older versions)**:

```sql
SELECT DISTINCT c.firstname
FROM customers c
LEFT JOIN employees e ON c.firstname = e.firstname
WHERE e.firstname IS NULL;
```

> **PostgreSQL** supports both `INTERSECT` and `EXCEPT` natively across all modern versions.

---

## 6.10 Common Join Mistakes

### Mistake 1: Accidental Cartesian Product

```sql
-- ❌ Missing join condition - produces Cartesian product
SELECT c.firstname, o.orderid
FROM customers c, orders o;
-- Returns 5 × 10 = 50 rows instead of 10
```

**Fix**: Always specify the join condition:

```sql
-- ✅ Correct
SELECT c.firstname, o.orderid
FROM customers c
INNER JOIN orders o ON c.customerid = o.customerid;
```

### Mistake 2: Ambiguous Column Names

```sql
-- ❌ Error: 'firstname' exists in both customers and employees
SELECT firstname, orderid
FROM orders o
JOIN customers c ON o.customerid = c.customerid
JOIN employees e ON o.salespersonid = e.employeeid;
-- ERROR 1052: Column 'firstname' in field list is ambiguous
```

**Fix**: Qualify with table alias:

```sql
-- ✅ Correct
SELECT c.firstname AS customer, e.firstname AS salesperson, o.orderid
FROM orders o
JOIN customers c ON o.customerid = c.customerid
JOIN employees e ON o.salespersonid = e.employeeid;
```

### Mistake 3: Using INNER JOIN When LEFT JOIN Is Needed

If you want ALL customers including those without orders, INNER JOIN silently drops them:

```sql
-- ❌ Anna is missing (she has no orders)
SELECT c.firstname, COUNT(o.orderid) AS order_count
FROM customers c
INNER JOIN orders o ON c.customerid = o.customerid
GROUP BY c.firstname;
-- Returns 4 rows (Anna excluded)

-- ✅ LEFT JOIN preserves Anna
SELECT c.firstname, COUNT(o.orderid) AS order_count
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
GROUP BY c.firstname;
-- Returns 5 rows (Anna with order_count = 0)
```

### Mistake 4: Filtering the Wrong Side of a LEFT JOIN

```sql
-- ❌ This converts the LEFT JOIN into an INNER JOIN
SELECT c.firstname, o.orderid
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
WHERE o.orderstatus = 'Delivered';
-- Anna is excluded because her orderstatus is NULL (no order)

-- ✅ Move the filter into the ON clause to preserve the LEFT JOIN
SELECT c.firstname, o.orderid
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
    AND o.orderstatus = 'Delivered';
-- Anna appears with NULL orderid
```

---

## Practice Exercises

### Beginner

**Exercise 6.1**: Write an INNER JOIN to display each order with the customer's full name (firstname, lastname) and the order date.

**Exercise 6.2**: Write a LEFT JOIN to show all customers and their orders. Include customers who have no orders.

**Exercise 6.3**: Join the `orders` table with the `products` table to display the product name, category, and sales for each order.

### Intermediate

**Exercise 6.4**: Write a 4-table JOIN: show `orderid`, `orderdate`, customer name, product name, and salesperson name for every order.

**Exercise 6.5**: Using `sql_hr`, write a self JOIN to display each employee and their manager's full name. Include employees who have no manager.

**Exercise 6.6**: Use `UNION ALL` to combine `orders` and `orders_archive` into a single result set. How many total rows are returned?

**Exercise 6.7**: Find customers who have NEVER placed an order using:
- (a) LEFT JOIN + WHERE IS NULL
- (b) NOT EXISTS
- Verify both return the same result.

**Exercise 6.8**: Using `sql_invoicing`, JOIN `invoices` with `clients` to show each invoice with the client name, invoice total, and payment total. Calculate the balance (invoice_total - payment_total) as a computed column.

### Challenge

**Exercise 6.9**: Using `sql_store`, write a query that shows:
- Customer full name
- Order date
- Product name
- Quantity
- Unit price from order_items
- Shipper name (if shipped)
This requires joining: `orders` → `customers`, `order_items` → `products`, `orders` → `shippers` (LEFT JOIN since not all orders have a shipper).

**Exercise 6.10**: Find customers whose total order value exceeds the average total order value across all customers. This requires JOINs, GROUP BY, and HAVING with a subquery.

**Exercise 6.11**: Simulate a FULL OUTER JOIN between `customers` and a subquery of distinct `customerid` values from `orders_archive`. Identify customers who appear in one table but not the other.

---

## Key Takeaways

1. **INNER JOIN** returns only matching rows from both tables. It is the most common join type.

2. **LEFT JOIN** returns all rows from the left table, with NULLs for non-matching right-side columns. Use it when you need to preserve rows that might not have a match.

3. **RIGHT JOIN** is the mirror of LEFT JOIN. Prefer LEFT JOIN (reorder tables) for consistency.

4. **FULL OUTER JOIN** returns all rows from both tables. MySQL does not support it natively - simulate with `UNION` of LEFT and RIGHT JOINs.

5. **CROSS JOIN** produces every combination of rows (Cartesian product). Use deliberately and cautiously.

6. **SELF JOIN** joins a table to itself - essential for hierarchical data (employee-manager).

7. **UNION combines result sets vertically** and removes duplicates. `UNION ALL` is faster and keeps duplicates.

8. **INTERSECT** returns common rows; **EXCEPT** returns rows in the first set but not the second.

9. **Always use table aliases** in JOINs to keep queries readable and avoid ambiguous column references.

10. **A WHERE filter on a LEFT JOINed table effectively converts it to an INNER JOIN.** Move the condition to the `ON` clause to preserve the LEFT JOIN behaviour.

---

## PostgreSQL Assignment

**PG-6.1**: In the PostgreSQL `salesdb`, join `sales.orders` with `sales.customers` using schema-qualified table names. Note the syntax difference.

**PG-6.2**: Write a FULL OUTER JOIN between `sales.customers` and `sales.orders` in PostgreSQL (native support - no UNION workaround needed).

**PG-6.3**: Use PostgreSQL's native `INTERSECT` and `EXCEPT` to find:
- Names that appear in both `sales.customers` and `sales.employees`
- Names that appear in `sales.customers` but not in `sales.employees`

---

## Next Chapter

→ **Chapter 7 - Row-Level Functions**: JOINs let you combine tables. Row-level functions let you transform individual values - cleaning strings, formatting dates, handling NULLs, and building conditional logic.
