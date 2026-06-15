# Chapter 9 - Advanced SQL Techniques

---

## Chapter Overview

This chapter introduces the constructs that elevate SQL from a data retrieval tool to a full programming environment. Subqueries let you nest queries inside queries. CTEs make complex logic readable. Views save reusable queries. Stored procedures encapsulate business logic. Triggers automate reactions to data changes.

### Prerequisites

- Completed Chapters 1–8
- `salesdb`, `sql_store`, and `sql_hr` loaded

### Reference Scripts

`18_Subqueries.sql`, `19_Common_Table_Expressions_CTE.sql`, `20_Views.sql`, `21_Temporary_Tables.sql`, `22_Stored_Procedures.sql`, `23_Triggers.sql`

```sql
USE salesdb;
```

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Write scalar, column, row, and table subqueries
2. Distinguish correlated from non-correlated subqueries
3. Structure complex queries with CTEs (`WITH` clause)
4. Write recursive CTEs for hierarchical data
5. Create, modify, and drop views
6. Create and use temporary tables
7. Write stored procedures with parameters and control flow
8. Create triggers for audit logging and data validation

---

## 9.1 Subqueries

A subquery is a query nested inside another query. It runs first, and its result is used by the outer query.

### 9.1.1 Scalar Subquery - Returns a Single Value

```sql
-- Find employees earning above the average salary
SELECT firstname, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

| firstname | salary |
|---|---|
| Mary | 75000 |
| Michael | 90000 |

The subquery `(SELECT AVG(salary) FROM employees)` returns a single value (68000), and the outer query uses it as a filter.

### 9.1.2 Column Subquery - Returns a List of Values

```sql
-- Find customers who have placed orders
SELECT firstname, lastname
FROM customers
WHERE customerid IN (
    SELECT DISTINCT customerid FROM orders
);
```

The subquery returns a list: `(1, 2, 3, 4)`. The outer query checks membership.

### 9.1.3 Table Subquery (Derived Table) - Returns a Result Set

```sql
-- Find the top-selling product
SELECT p.product, order_stats.total_sales
FROM products p
JOIN (
    SELECT productid, SUM(sales) AS total_sales
    FROM orders
    GROUP BY productid
) AS order_stats ON p.productid = order_stats.productid
ORDER BY order_stats.total_sales DESC
LIMIT 1;
```

| product | total_sales |
|---|---|
| Bottle | 140 |

The subquery creates a virtual table (`order_stats`) that the outer query JOINs to.

### 9.1.4 Correlated Subqueries

A correlated subquery references columns from the outer query. It runs **once per row** of the outer query.

```sql
-- Find orders where the sales exceed the average sales for that product
SELECT 
    orderid,
    productid,
    sales
FROM orders o
WHERE sales > (
    SELECT AVG(sales)
    FROM orders o2
    WHERE o2.productid = o.productid  -- correlation: references outer query
);
```

| orderid | productid | sales |
|---|---|---|
| 8 | 101 | 90 |
| 10 | 102 | 60 |
| 6 | 104 | 50 |

For each order, the subquery calculates the average sales for *that specific product*. Orders beating their product's average are returned.

### 9.1.5 Subqueries in SELECT

```sql
-- Show each customer's total order count alongside their details
SELECT 
    c.firstname,
    c.country,
    (SELECT COUNT(*) FROM orders o WHERE o.customerid = c.customerid) AS order_count
FROM customers c;
```

| firstname | country | order_count |
|---|---|---|
| Jossef | Germany | 3 |
| Kevin | USA | 3 |
| Mary | USA | 3 |
| Mark | Germany | 1 |
| Anna | USA | 0 |

---

## 9.2 Common Table Expressions (CTEs)

CTEs are named temporary result sets defined at the beginning of a query using the `WITH` clause. They make complex queries dramatically more readable.

### 9.2.1 Basic CTE

```sql
-- CTE to calculate total sales per customer, then filter
WITH customer_sales AS (
    SELECT 
        customerid,
        SUM(sales) AS total_sales,
        COUNT(*) AS order_count
    FROM orders
    GROUP BY customerid
)
SELECT 
    c.firstname,
    cs.total_sales,
    cs.order_count
FROM customer_sales cs
JOIN customers c ON cs.customerid = c.customerid
WHERE cs.total_sales > 80
ORDER BY cs.total_sales DESC;
```

| firstname | total_sales | order_count |
|---|---|---|
| Mary | 125 | 3 |
| Jossef | 110 | 3 |
| Mark | 90 | 1 |

### 9.2.2 Multiple CTEs

```sql
WITH 
product_sales AS (
    SELECT productid, SUM(sales) AS total_sales
    FROM orders
    GROUP BY productid
),
product_details AS (
    SELECT p.product, p.category, ps.total_sales
    FROM products p
    JOIN product_sales ps ON p.productid = ps.productid
)
SELECT * FROM product_details
ORDER BY total_sales DESC;
```

| product | category | total_sales |
|---|---|---|
| Bottle | Accessories | 140 |
| Tire | Accessories | 105 |
| Caps | Clothing | 75 |
| Gloves | Clothing | 60 |

### 9.2.3 Recursive CTEs

Recursive CTEs call themselves, enabling traversal of hierarchical data like org charts or bill-of-materials.

```sql
-- Build the employee hierarchy from salesdb
WITH RECURSIVE org_chart AS (
    -- Anchor: start with employees who have no manager (top level)
    SELECT 
        employeeid,
        firstname,
        managerid,
        0 AS level,
        CAST(firstname AS CHAR(200)) AS path
    FROM employees
    WHERE managerid IS NULL
    
    UNION ALL
    
    -- Recursive: find employees who report to someone already in the result
    SELECT 
        e.employeeid,
        e.firstname,
        e.managerid,
        oc.level + 1,
        CONCAT(oc.path, ' → ', e.firstname)
    FROM employees e
    INNER JOIN org_chart oc ON e.managerid = oc.employeeid
)
SELECT 
    CONCAT(REPEAT('  ', level), firstname) AS org_tree,
    level,
    path
FROM org_chart
ORDER BY path;
```

| org_tree | level | path |
|---|---|---|
| Frank | 0 | Frank |
| &nbsp;&nbsp;Kevin | 1 | Frank → Kevin |
| &nbsp;&nbsp;&nbsp;&nbsp;Michael | 2 | Frank → Kevin → Michael |
| &nbsp;&nbsp;Mary | 1 | Frank → Mary |
| &nbsp;&nbsp;&nbsp;&nbsp;Carol | 2 | Frank → Mary → Carol |

### 9.2.4 Generating a Date Series

```sql
-- Generate all dates in January 2025
WITH RECURSIVE date_series AS (
    SELECT DATE('2025-01-01') AS date_val
    UNION ALL
    SELECT date_val + INTERVAL 1 DAY
    FROM date_series
    WHERE date_val < '2025-01-31'
)
SELECT date_val FROM date_series;
```

This generates 31 rows, one per day - useful for creating calendar tables or filling gaps in time-series data.

---

## 9.3 Views

A view is a saved query that behaves like a virtual table. It does not store data - it runs the query every time you reference it.

### 9.3.1 Creating a View

```sql
CREATE VIEW v_order_summary AS
SELECT 
    o.orderid,
    c.firstname AS customer,
    p.product,
    o.orderdate,
    o.sales,
    o.orderstatus
FROM orders o
JOIN customers c ON o.customerid = c.customerid
JOIN products p ON o.productid = p.productid;
```

Now use it like a table:

```sql
SELECT * FROM v_order_summary WHERE orderstatus = 'Delivered';
```

### 9.3.2 Modifying a View

```sql
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
    o.orderid,
    c.firstname AS customer,
    p.product,
    p.category,             -- added column
    o.orderdate,
    o.sales,
    o.orderstatus
FROM orders o
JOIN customers c ON o.customerid = c.customerid
JOIN products p ON o.productid = p.productid;
```

### 9.3.3 Dropping a View

```sql
DROP VIEW IF EXISTS v_order_summary;
```

### 9.3.4 When to Use Views

| Use Case | Example |
|---|---|
| Simplify complex queries | Wrap a 4-table JOIN into a view; analysts query the view directly |
| Security | Give users access to a view with limited columns, not the underlying table |
| Consistent logic | Ensure all reports use the same join and filter logic |
| Backward compatibility | Rename a table but create a view with the old name |

---

## 9.4 Temporary Tables

Temporary tables exist only for the duration of your session. When you disconnect, they are automatically deleted.

```sql
-- Create a temporary table
CREATE TEMPORARY TABLE temp_high_value_orders AS
SELECT * FROM orders WHERE sales >= 50;

-- Use it like any table
SELECT * FROM temp_high_value_orders;

-- It disappears when you disconnect
```

### CTEs vs Temporary Tables vs Views

| Feature | CTE | Temporary Table | View |
|---|---|---|---|
| Scope | Single query | Session | Permanent (until dropped) |
| Stores data? | No | Yes (materialised) | No |
| Can be indexed? | No | Yes | No |
| Performance | Re-evaluated | Materialised once | Re-evaluated |
| Best for | Readability, recursion | Intermediate results, complex ETL | Reusable queries, security |

---

## 9.5 Stored Procedures

Stored procedures are precompiled SQL programs stored in the database. They accept parameters, contain control flow, and can perform complex operations.

### 9.5.1 Creating a Simple Procedure

```sql
-- Change the delimiter because procedures contain semicolons
DELIMITER //

CREATE PROCEDURE get_orders_by_status(IN p_status VARCHAR(50))
BEGIN
    SELECT 
        orderid, customerid, orderdate, sales, orderstatus
    FROM orders
    WHERE orderstatus = p_status;
END //

DELIMITER ;
```

Call it:

```sql
CALL get_orders_by_status('Delivered');
```

### 9.5.2 Parameters: IN, OUT, INOUT

```sql
DELIMITER //

CREATE PROCEDURE get_sales_stats(
    IN p_productid INT,
    OUT p_total DECIMAL(10,2),
    OUT p_avg DECIMAL(10,2),
    OUT p_count INT
)
BEGIN
    SELECT 
        SUM(sales), AVG(sales), COUNT(*)
    INTO p_total, p_avg, p_count
    FROM orders
    WHERE productid = p_productid;
END //

DELIMITER ;

-- Call with OUT parameters
CALL get_sales_stats(101, @total, @avg, @count);
SELECT @total AS total, @avg AS average, @count AS order_count;
```

| total | average | order_count |
|---|---|---|
| 140.00 | 35.0000 | 4 |

### 9.5.3 Control Flow

```sql
DELIMITER //

CREATE PROCEDURE classify_customer(
    IN p_customerid INT,
    OUT p_tier VARCHAR(20)
)
BEGIN
    DECLARE v_score INT;
    
    SELECT score INTO v_score 
    FROM customers 
    WHERE customerid = p_customerid;
    
    IF v_score IS NULL THEN
        SET p_tier = 'Unrated';
    ELSEIF v_score >= 800 THEN
        SET p_tier = 'Platinum';
    ELSEIF v_score >= 500 THEN
        SET p_tier = 'Gold';
    ELSE
        SET p_tier = 'Silver';
    END IF;
END //

DELIMITER ;

CALL classify_customer(2, @tier);
SELECT @tier;  -- 'Platinum' (Kevin's score is 900)
```

### 9.5.4 Dropping a Procedure

```sql
DROP PROCEDURE IF EXISTS get_orders_by_status;
```

---

## 9.6 Triggers

A trigger is a stored procedure that **automatically executes** when an INSERT, UPDATE, or DELETE occurs on a table.

### 9.6.1 Audit Log Example

```sql
-- Create an audit table
CREATE TABLE orders_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    orderid INT,
    action VARCHAR(10),
    old_sales DECIMAL(10,2),
    new_sales DECIMAL(10,2),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100) DEFAULT (CURRENT_USER())
);

-- Create a trigger that logs UPDATE changes
DELIMITER //

CREATE TRIGGER trg_orders_update_audit
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.sales != NEW.sales THEN
        INSERT INTO orders_audit (orderid, action, old_sales, new_sales)
        VALUES (OLD.orderid, 'UPDATE', OLD.sales, NEW.sales);
    END IF;
END //

DELIMITER ;
```

Now every time an order's sales value is updated, a record is automatically inserted into `orders_audit`:

```sql
UPDATE orders SET sales = 100 WHERE orderid = 1;

SELECT * FROM orders_audit;
```

| audit_id | orderid | action | old_sales | new_sales | changed_at | changed_by |
|---|---|---|---|---|---|---|
| 1 | 1 | UPDATE | 10.00 | 100.00 | 2026-06-11 08:30:00 | root@localhost |

### 9.6.2 BEFORE vs AFTER Triggers

| Type | When It Fires | Use Case |
|---|---|---|
| `BEFORE INSERT` | Before the new row is saved | Data validation, auto-populating fields |
| `AFTER INSERT` | After the new row is saved | Audit logging, notifications |
| `BEFORE UPDATE` | Before the update is applied | Preventing invalid changes |
| `AFTER UPDATE` | After the update is applied | Logging changes, syncing related data |
| `BEFORE DELETE` | Before the row is removed | Archiving data before deletion |
| `AFTER DELETE` | After the row is removed | Logging deletions |

### 9.6.3 Dropping a Trigger

```sql
DROP TRIGGER IF EXISTS trg_orders_update_audit;
```

---

## 9.7 Pivoting Data

MySQL does not have a native PIVOT statement. Use conditional aggregation instead:

```sql
-- Pivot: sales by product for each customer
SELECT 
    c.firstname,
    SUM(CASE WHEN p.product = 'Bottle' THEN o.sales ELSE 0 END) AS Bottle,
    SUM(CASE WHEN p.product = 'Tire' THEN o.sales ELSE 0 END) AS Tire,
    SUM(CASE WHEN p.product = 'Socks' THEN o.sales ELSE 0 END) AS Socks,
    SUM(CASE WHEN p.product = 'Caps' THEN o.sales ELSE 0 END) AS Caps,
    SUM(CASE WHEN p.product = 'Gloves' THEN o.sales ELSE 0 END) AS Gloves
FROM orders o
JOIN customers c ON o.customerid = c.customerid
JOIN products p ON o.productid = p.productid
GROUP BY c.firstname;
```

| firstname | Bottle | Tire | Socks | Caps | Gloves |
|---|---|---|---|---|---|
| Jossef | 20 | 30 | 0 | 0 | 60 |
| Kevin | 30 | 0 | 0 | 25 | 0 |
| Mark | 90 | 0 | 0 | 0 | 0 |
| Mary | 0 | 75 | 0 | 50 | 0 |

---

## Practice Exercises

### Beginner

**Exercise 9.1**: Write a subquery to find all products that have never been ordered.

**Exercise 9.2**: Create a CTE that calculates total sales per customer, then join it with the customers table to show names.

**Exercise 9.3**: Create a view called `v_customer_orders` that joins customers and orders.

### Intermediate

**Exercise 9.4**: Write a correlated subquery to find orders where the sales exceed the average sales for that product.

**Exercise 9.5**: Write a recursive CTE to traverse the employee hierarchy in `sql_hr`.

**Exercise 9.6**: Create a stored procedure that accepts a country name and returns all customers from that country.

**Exercise 9.7**: Create a BEFORE INSERT trigger on the customers table that sets the score to 0 if NULL is provided.

### Challenge

**Exercise 9.8**: Pivot the orders data to show total sales per month (columns: Jan, Feb, Mar) for each product.

**Exercise 9.9**: Create a stored procedure with IF/ELSE logic that: takes a customer ID, calculates their total order value, and returns their tier (Platinum > $100, Gold > $50, Silver ≤ $50).

**Exercise 9.10**: Build a complete audit system: create an audit table and triggers for INSERT, UPDATE, and DELETE on the customers table.

---

## Key Takeaways

1. **Subqueries** nest queries inside queries. Scalar subqueries return one value, column subqueries return a list, table subqueries return a result set. Correlated subqueries reference the outer query and run once per outer row.

2. **CTEs** (`WITH` clause) make complex queries readable by naming intermediate results. Recursive CTEs traverse hierarchies and generate sequences.

3. **Views** save reusable queries as virtual tables. They simplify access, enforce security, and ensure consistent logic.

4. **Temporary tables** store intermediate results for the session. Use them when a CTE is too slow (materialisation needed) or when you need indexes on intermediate results.

5. **Stored procedures** encapsulate reusable logic with parameters and control flow. Use DELIMITER to handle semicolons inside the procedure body.

6. **Triggers** react automatically to data changes. Use AFTER triggers for auditing and BEFORE triggers for validation.

---

## PostgreSQL Assignment

**PG-9.1**: Rewrite the recursive org chart CTE for `sales.employees` using PostgreSQL syntax (no `CAST(... AS CHAR(200))` - use `TEXT` instead).

**PG-9.2**: PostgreSQL supports `CREATE OR REPLACE FUNCTION` instead of stored procedures (prior to PG 11). Create a function that returns all orders for a given status.

**PG-9.3**: Create a view in PostgreSQL and query it.

---

## Next Chapter

→ **Chapter 10 - Performance Optimization**: You can now write any query. The next question is: how do you make it fast?
