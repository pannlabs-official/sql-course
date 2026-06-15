# Chapter 8 — Aggregation & Analytical Functions

---

## Chapter Overview

This is the chapter that separates SQL beginners from SQL analysts. Aggregate functions collapse many rows into summary values. Window functions perform calculations across rows *without* collapsing them. Together, they enable the analytical queries that drive business decisions: total revenue, running totals, rankings, moving averages, year-over-year comparisons, and percentile analysis.

### Prerequisites

- Completed Chapters 1–7 (especially GROUP BY from Chapter 2 and JOINs from Chapter 6)
- `salesdb` and `sql_invoicing` loaded

### Reference Scripts

- `13_Aggregate_Functions.sql`
- `14_Window_Functions_Basics.sql`
- `15_Window_Aggregations.sql`
- `16_Window_Ranking.sql`
- `17_Window_Value_Functions.sql`

```sql
USE salesdb;
```

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Use all aggregate functions: COUNT, SUM, AVG, MIN, MAX
2. Understand how aggregates interact with NULLs
3. Use GROUP BY with ROLLUP for subtotals and grand totals
4. Explain the conceptual shift from GROUP BY to window functions
5. Write window functions with OVER, PARTITION BY, ORDER BY, and FRAME clauses
6. Calculate running totals, moving averages, and cumulative sums
7. Rank rows with ROW_NUMBER, RANK, DENSE_RANK, and NTILE
8. Access neighbouring rows with LAG, LEAD, FIRST_VALUE, LAST_VALUE

---

## 8.1 Aggregate Functions

### 8.1.1 The Five Core Aggregates

```sql
SELECT 
    COUNT(*) AS total_orders,
    SUM(sales) AS total_sales,
    AVG(sales) AS avg_sales,
    MIN(sales) AS min_sale,
    MAX(sales) AS max_sale
FROM orders;
```

| total_orders | total_sales | avg_sales | min_sale | max_sale |
|---|---|---|---|---|
| 10 | 380 | 38.0000 | 10 | 90 |

### 8.1.2 COUNT Variations — What Each Actually Counts

```sql
SELECT 
    COUNT(*) AS count_all_rows,           -- 5 (counts every row)
    COUNT(score) AS count_non_null_scores, -- 4 (skips Anna's NULL)
    COUNT(DISTINCT country) AS unique_countries  -- 2 (Germany, USA)
FROM customers;
```

| count_all_rows | count_non_null_scores | unique_countries |
|---|---|---|
| 5 | 4 | 2 |

- `COUNT(*)` — counts all rows, regardless of NULLs
- `COUNT(column)` — counts rows where that column is NOT NULL
- `COUNT(DISTINCT column)` — counts unique non-NULL values

### 8.1.3 NULL Behaviour in Aggregates

All aggregate functions **ignore NULLs** (except `COUNT(*)`):

```sql
-- Anna has score = NULL
SELECT AVG(score) FROM customers;  -- (350+900+750+500)/4 = 625, NOT /5
```

| AVG(score) |
|---|
| 625.0000 |

The average is 625, calculated from 4 values (not 5). Anna's NULL is excluded entirely — not treated as 0.

> ⚠️ **Common trap**: If you want NULLs treated as 0, use `AVG(COALESCE(score, 0))`:
> ```sql
> SELECT AVG(COALESCE(score, 0)) FROM customers;  -- (350+900+750+500+0)/5 = 500
> ```

---

## 8.2 GROUP BY — Deep Dive

### 8.2.1 GROUP BY with Multiple Columns

```sql
-- Sales breakdown by product and order status
SELECT 
    productid,
    orderstatus,
    COUNT(*) AS order_count,
    SUM(sales) AS total_sales
FROM orders
GROUP BY productid, orderstatus
ORDER BY productid, orderstatus;
```

| productid | orderstatus | order_count | total_sales |
|---|---|---|---|
| 101 | Delivered | 1 | 20 |
| 101 | Shipped | 3 | 120 |
| 102 | Delivered | 1 | 30 |
| 102 | Shipped | 2 | 75 |
| 104 | Delivered | 2 | 75 |
| 105 | Shipped | 1 | 60 |

### 8.2.2 GROUP BY with Expressions

```sql
-- Monthly sales summary
SELECT 
    DATE_FORMAT(orderdate, '%Y-%m') AS order_month,
    COUNT(*) AS order_count,
    SUM(sales) AS total_sales
FROM orders
GROUP BY DATE_FORMAT(orderdate, '%Y-%m')
ORDER BY order_month;
```

| order_month | order_count | total_sales |
|---|---|---|
| 2025-01 | 4 | 105 |
| 2025-02 | 4 | 195 |
| 2025-03 | 2 | 80 |

### 8.2.3 GROUP BY with ROLLUP — Subtotals and Grand Total

`ROLLUP` adds subtotal and grand total rows to your grouped output:

```sql
SELECT 
    COALESCE(orderstatus, 'ALL STATUSES') AS orderstatus,
    COUNT(*) AS order_count,
    SUM(sales) AS total_sales
FROM orders
GROUP BY orderstatus WITH ROLLUP;
```

| orderstatus | order_count | total_sales |
|---|---|---|
| Delivered | 4 | 105 |
| Shipped | 6 | 275 |
| **ALL STATUSES** | **10** | **380** |

The last row is the grand total, added by ROLLUP. Without COALESCE, the `orderstatus` column would show NULL for the total row.

### 8.2.4 GROUPING() — Distinguishing Real NULLs from ROLLUP NULLs

```sql
SELECT 
    orderstatus,
    SUM(sales) AS total_sales,
    GROUPING(orderstatus) AS is_rollup_row
FROM orders
GROUP BY orderstatus WITH ROLLUP;
```

| orderstatus | total_sales | is_rollup_row |
|---|---|---|
| Delivered | 105 | 0 |
| Shipped | 275 | 0 |
| NULL | 380 | 1 |

`GROUPING()` returns 1 for ROLLUP-generated rows and 0 for regular grouped rows. This lets you distinguish a genuine NULL in the data from a ROLLUP subtotal.

---

## 8.3 Window Functions — The Game Changer

### 8.3.1 The Conceptual Shift

**GROUP BY** collapses rows: 10 orders → 2 rows (one per status).  
**Window functions** keep all rows: 10 orders → 10 rows, each with an additional calculated value.

This is the fundamental difference. Window functions compute aggregates, ranks, and comparisons **across a "window" of related rows** without reducing the number of rows in the output.

### 8.3.2 The OVER Clause — Defining the Window

The `OVER()` clause turns an aggregate function into a window function:

```sql
-- Total sales across ALL orders, shown alongside each order
SELECT 
    orderid,
    orderdate,
    productid,
    sales,
    SUM(sales) OVER() AS total_sales
FROM orders;
```

| orderid | orderdate | productid | sales | total_sales |
|---|---|---|---|---|
| 1 | 2025-01-01 | 101 | 10 | 380 |
| 2 | 2025-01-05 | 102 | 15 | 380 |
| 3 | 2025-01-10 | 101 | 20 | 380 |
| 4 | 2025-01-20 | 105 | 60 | 380 |
| 5 | 2025-02-01 | 104 | 25 | 380 |
| 6 | 2025-02-05 | 104 | 50 | 380 |
| 7 | 2025-02-15 | 102 | 30 | 380 |
| 8 | 2025-02-18 | 101 | 90 | 380 |
| 9 | 2025-03-10 | 101 | 20 | 380 |
| 10 | 2025-03-15 | 102 | 60 | 380 |

All 10 rows remain. Each row now carries the grand total (380) alongside its individual data. With GROUP BY, you would lose the individual order details.

### 8.3.3 PARTITION BY — Windowing by Category

`PARTITION BY` divides the window into groups (like GROUP BY, but without collapsing rows):

```sql
-- Total sales per product, shown alongside each order
SELECT 
    orderid,
    orderdate,
    productid,
    sales,
    SUM(sales) OVER() AS grand_total,
    SUM(sales) OVER(PARTITION BY productid) AS product_total
FROM orders;
```

| orderid | orderdate | productid | sales | grand_total | product_total |
|---|---|---|---|---|---|
| 1 | 2025-01-01 | 101 | 10 | 380 | 140 |
| 3 | 2025-01-10 | 101 | 20 | 380 | 140 |
| 8 | 2025-02-18 | 101 | 90 | 380 | 140 |
| 9 | 2025-03-10 | 101 | 20 | 380 | 140 |
| 2 | 2025-01-05 | 102 | 15 | 380 | 105 |
| 7 | 2025-02-15 | 102 | 30 | 380 | 105 |
| 10 | 2025-03-15 | 102 | 60 | 380 | 105 |
| 5 | 2025-02-01 | 104 | 25 | 380 | 75 |
| 6 | 2025-02-05 | 104 | 50 | 380 | 75 |
| 4 | 2025-01-20 | 105 | 60 | 380 | 60 |

Each row now has both the grand total (380) and its product-specific total. Product 101 orders each show 140, product 102 orders show 105, etc.

### 8.3.4 ORDER BY — Ordering Within the Window

Adding `ORDER BY` inside `OVER()` creates **running calculations**:

```sql
-- Running total of sales, ordered by date
SELECT 
    orderid,
    orderdate,
    sales,
    SUM(sales) OVER(ORDER BY orderdate) AS running_total
FROM orders;
```

| orderid | orderdate | sales | running_total |
|---|---|---|---|
| 1 | 2025-01-01 | 10 | 10 |
| 2 | 2025-01-05 | 15 | 25 |
| 3 | 2025-01-10 | 20 | 45 |
| 4 | 2025-01-20 | 60 | 105 |
| 5 | 2025-02-01 | 25 | 130 |
| 6 | 2025-02-05 | 50 | 180 |
| 7 | 2025-02-15 | 30 | 210 |
| 8 | 2025-02-18 | 90 | 300 |
| 9 | 2025-03-10 | 20 | 320 |
| 10 | 2025-03-15 | 60 | 380 |

The `running_total` accumulates as we move through the ordered rows. This is a cumulative sum.

### 8.3.5 PARTITION BY + ORDER BY — Running Totals Per Category

```sql
-- Running total of sales PER ORDER STATUS
SELECT 
    orderid,
    orderdate,
    orderstatus,
    sales,
    SUM(sales) OVER(
        PARTITION BY orderstatus 
        ORDER BY orderdate
    ) AS status_running_total
FROM orders;
```

| orderid | orderdate | orderstatus | sales | status_running_total |
|---|---|---|---|---|
| 1 | 2025-01-01 | Delivered | 10 | 10 |
| 3 | 2025-01-10 | Delivered | 20 | 30 |
| 5 | 2025-02-01 | Delivered | 25 | 55 |
| 6 | 2025-02-05 | Delivered | 50 | 105 |
| 2 | 2025-01-05 | Shipped | 15 | 15 |
| 4 | 2025-01-20 | Shipped | 60 | 75 |
| 7 | 2025-02-15 | Shipped | 30 | 105 |
| 8 | 2025-02-18 | Shipped | 90 | 195 |
| 9 | 2025-03-10 | Shipped | 20 | 215 |
| 10 | 2025-03-15 | Shipped | 60 | 275 |

The running total resets for each partition (Delivered resets, Shipped resets).

---

## 8.4 The FRAME Clause

The FRAME clause gives you fine-grained control over exactly which rows within the window are included in the calculation.

### 8.4.1 FRAME Syntax

```sql
ROWS BETWEEN <start> AND <end>
```

Where `<start>` and `<end>` can be:
- `UNBOUNDED PRECEDING` — from the first row of the partition
- `N PRECEDING` — N rows before the current row
- `CURRENT ROW` — the current row
- `N FOLLOWING` — N rows after the current row
- `UNBOUNDED FOLLOWING` — to the last row of the partition

### 8.4.2 Moving Average (3-Row Window)

```sql
-- 3-row moving average of sales (current + 1 preceding + 1 following)
SELECT 
    orderid,
    orderdate,
    sales,
    AVG(sales) OVER(
        ORDER BY orderdate
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) AS moving_avg_3
FROM orders;
```

| orderid | orderdate | sales | moving_avg_3 |
|---|---|---|---|
| 1 | 2025-01-01 | 10 | 12.5000 |
| 2 | 2025-01-05 | 15 | 15.0000 |
| 3 | 2025-01-10 | 20 | 31.6667 |
| 4 | 2025-01-20 | 60 | 35.0000 |
| ... | ... | ... | ... |

For order 2: `AVG(10, 15, 20) = 15.0`. For order 1 (no preceding row): `AVG(10, 15) = 12.5`.

### 8.4.3 Cumulative Sum

```sql
-- Cumulative sales from the start up to the current row
SELECT 
    orderid,
    orderdate,
    sales,
    SUM(sales) OVER(
        ORDER BY orderdate
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_sales
FROM orders;
```

This is equivalent to `SUM(sales) OVER(ORDER BY orderdate)` — the default frame when ORDER BY is specified is `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.

### 8.4.4 ROWS vs RANGE

- `ROWS` — counts physical rows (position-based)
- `RANGE` — groups logically equivalent values (value-based)

If two rows have the same `orderdate`, `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` includes both in the calculation, while `ROWS` treats them as separate positions.

> For most analytical work, **use ROWS**. RANGE is rarely needed and can produce unexpected results.

---

## 8.5 Ranking Functions

### 8.5.1 ROW_NUMBER — Unique Sequential Number

```sql
SELECT 
    orderid,
    sales,
    ROW_NUMBER() OVER(ORDER BY sales DESC) AS row_num
FROM orders;
```

| orderid | sales | row_num |
|---|---|---|
| 8 | 90 | 1 |
| 4 | 60 | 2 |
| 10 | 60 | 3 |
| 6 | 50 | 4 |
| 7 | 30 | 5 |
| ... | ... | ... |

Every row gets a unique number. Ties (orders 4 and 10 both have sales = 60) are assigned arbitrarily.

### 8.5.2 RANK — Gaps After Ties

```sql
SELECT 
    orderid,
    sales,
    RANK() OVER(ORDER BY sales DESC) AS rank_num
FROM orders;
```

| orderid | sales | rank_num |
|---|---|---|
| 8 | 90 | 1 |
| 4 | 60 | 2 |
| 10 | 60 | 2 |
| 6 | 50 | **4** |
| ... | ... | ... |

Orders 4 and 10 both get rank 2 (tied). The next rank is 4 (not 3) — the gap reflects the number of rows at the tied rank.

### 8.5.3 DENSE_RANK — No Gaps

```sql
SELECT 
    orderid,
    sales,
    DENSE_RANK() OVER(ORDER BY sales DESC) AS dense_rank_num
FROM orders;
```

| orderid | sales | dense_rank_num |
|---|---|---|
| 8 | 90 | 1 |
| 4 | 60 | 2 |
| 10 | 60 | 2 |
| 6 | 50 | **3** |
| ... | ... | ... |

Same as RANK, but the next value after the tie is 3 (no gap).

### 8.5.4 NTILE — Dividing Into Buckets

```sql
-- Divide orders into 4 quartiles by sales
SELECT 
    orderid,
    sales,
    NTILE(4) OVER(ORDER BY sales DESC) AS quartile
FROM orders;
```

| orderid | sales | quartile |
|---|---|---|
| 8 | 90 | 1 |
| 4 | 60 | 1 |
| 10 | 60 | 1 |
| 6 | 50 | 2 |
| 7 | 30 | 2 |
| 5 | 25 | 2 |
| 3 | 20 | 3 |
| 9 | 20 | 3 |
| 2 | 15 | 4 |
| 1 | 10 | 4 |

### 8.5.5 Ranking Within Partitions

```sql
-- Rank customers by total sales
SELECT 
    customerid,
    SUM(sales) AS total_sales,
    RANK() OVER(ORDER BY SUM(sales) DESC) AS customer_rank
FROM orders
GROUP BY customerid;
```

| customerid | total_sales | customer_rank |
|---|---|---|
| 3 | 125 | 1 |
| 1 | 110 | 2 |
| 4 | 90 | 3 |
| 2 | 55 | 4 |

---

## 8.6 Value Functions

Value functions access data from other rows in the window without self-joining.

### 8.6.1 LAG — Previous Row Value

```sql
-- Compare each order's sales to the previous order's sales
SELECT 
    orderid,
    orderdate,
    sales,
    LAG(sales) OVER(ORDER BY orderdate) AS prev_sales,
    sales - LAG(sales) OVER(ORDER BY orderdate) AS sales_change
FROM orders;
```

| orderid | orderdate | sales | prev_sales | sales_change |
|---|---|---|---|---|
| 1 | 2025-01-01 | 10 | NULL | NULL |
| 2 | 2025-01-05 | 15 | 10 | 5 |
| 3 | 2025-01-10 | 20 | 15 | 5 |
| 4 | 2025-01-20 | 60 | 20 | 40 |
| 5 | 2025-02-01 | 25 | 60 | -35 |
| ... | ... | ... | ... | ... |

`LAG(sales)` looks at the previous row. The first row has no previous row → NULL.

`LAG(sales, 2)` would look 2 rows back. `LAG(sales, 1, 0)` provides a default value (0) instead of NULL.

### 8.6.2 LEAD — Next Row Value

```sql
-- Compare each order's sales to the NEXT order
SELECT 
    orderid,
    orderdate,
    sales,
    LEAD(sales) OVER(ORDER BY orderdate) AS next_sales
FROM orders;
```

| orderid | orderdate | sales | next_sales |
|---|---|---|---|
| 1 | 2025-01-01 | 10 | 15 |
| 2 | 2025-01-05 | 15 | 20 |
| ... | ... | ... | ... |
| 10 | 2025-03-15 | 60 | NULL |

### 8.6.3 FIRST_VALUE / LAST_VALUE

```sql
-- Show the highest sale alongside each order
SELECT 
    orderid,
    sales,
    FIRST_VALUE(sales) OVER(ORDER BY sales DESC) AS highest_sale,
    LAST_VALUE(sales) OVER(
        ORDER BY sales DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS lowest_sale
FROM orders;
```

| orderid | sales | highest_sale | lowest_sale |
|---|---|---|---|
| 8 | 90 | 90 | 10 |
| 4 | 60 | 90 | 10 |
| ... | ... | 90 | 10 |

> ⚠️ **LAST_VALUE requires a full frame specification.** The default frame (`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`) means `LAST_VALUE` returns the current row's value, not the actual last value. Always add `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` with `LAST_VALUE`.

---

## 8.7 Window Function Rules

### Rule 1: Only in SELECT and ORDER BY

Window functions can **only** appear in `SELECT` and `ORDER BY` clauses. They cannot be used in `WHERE`, `GROUP BY`, or `HAVING`.

```sql
-- ❌ Invalid: window function in WHERE
WHERE RANK() OVER(ORDER BY sales DESC) <= 3

-- ✅ Workaround: use a subquery or CTE
SELECT * FROM (
    SELECT orderid, sales, RANK() OVER(ORDER BY sales DESC) AS rnk
    FROM orders
) ranked
WHERE rnk <= 3;
```

### Rule 2: No Nesting

Window functions cannot be nested inside each other:

```sql
-- ❌ Invalid
SUM(SUM(sales) OVER(PARTITION BY productid)) OVER()
```

### Rule 3: Window Functions Execute After WHERE and GROUP BY

Because window functions run in the SELECT phase (after FROM, WHERE, GROUP BY, HAVING), they operate on the already-filtered, already-grouped data.

---

## Common Mistakes & Misconceptions

### Mistake 1: COUNT(*) vs COUNT(column)

```sql
COUNT(*)     -- counts ALL rows, including those with NULLs
COUNT(score) -- counts only rows where score IS NOT NULL
```

### Mistake 2: Using Window Functions in WHERE

```sql
-- ❌ This does not work
WHERE ROW_NUMBER() OVER(ORDER BY sales DESC) <= 3
```

Use a subquery.

### Mistake 3: Forgetting the FRAME for LAST_VALUE

The default frame with ORDER BY stops at the current row, making LAST_VALUE useless.

### Mistake 4: Confusing RANK vs DENSE_RANK

- RANK: 1, 2, 2, **4** (gap after ties)
- DENSE_RANK: 1, 2, 2, **3** (no gap)

---

## Practice Exercises

### Beginner

**Exercise 8.1**: Calculate the total, average, min, and max sales from the `orders` table.

**Exercise 8.2**: Count the number of orders per `orderstatus`.

**Exercise 8.3**: Add a `total_sales` column to every order using `SUM() OVER()`.

### Intermediate

**Exercise 8.4**: Calculate the running total of sales ordered by `orderdate`.

**Exercise 8.5**: Rank all orders by sales (descending) using ROW_NUMBER, RANK, and DENSE_RANK side by side.

**Exercise 8.6**: Calculate the total sales per product, shown alongside each order, using `SUM() OVER(PARTITION BY productid)`.

**Exercise 8.7**: Using `sql_invoicing`, calculate the total invoice amount per client and rank clients by total revenue.

**Exercise 8.8**: For each order, show the sales from the previous order and the next order using LAG and LEAD.

### Challenge

**Exercise 8.9**: Calculate a 3-order moving average of sales (1 preceding, current, 1 following), partitioned by order status.

**Exercise 8.10**: Calculate each order's percentage contribution to total sales: `sales / SUM(sales) OVER() * 100`.

**Exercise 8.11**: Using GROUP BY with ROLLUP, create a sales summary by product and order status with subtotals and a grand total.

**Exercise 8.12**: Find the top 2 orders by sales for each product (use ROW_NUMBER with PARTITION BY). This requires a subquery because you cannot filter window functions in WHERE.

---

## Key Takeaways

1. **Aggregate functions collapse rows.** COUNT, SUM, AVG, MIN, MAX reduce groups to single values. They ignore NULLs (except COUNT(*)).

2. **GROUP BY with ROLLUP** adds subtotal and grand total rows. Use `GROUPING()` to identify them.

3. **Window functions keep all rows.** The OVER() clause is what makes an aggregate a window function. Empty OVER() = entire table as one window.

4. **PARTITION BY** is the window equivalent of GROUP BY — it divides rows into groups without collapsing.

5. **ORDER BY inside OVER()** enables running/cumulative calculations.

6. **The FRAME clause** controls exactly which rows are included: `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING` for a 3-row window.

7. **Ranking functions**: ROW_NUMBER (unique), RANK (gaps at ties), DENSE_RANK (no gaps), NTILE (buckets).

8. **LAG/LEAD** access previous/next row values without self-joins. Essential for period-over-period comparisons.

9. **Window functions can only appear in SELECT and ORDER BY.** Use subqueries to filter on window function results.

---

## PostgreSQL Assignment

**PG-8.1**: Run the running total query on `sales.orders`. PostgreSQL syntax is identical for window functions.

**PG-8.2**: Use `FETCH FIRST 3 ROWS WITH TIES` in PostgreSQL to get the top 3 orders by sales, including ties.

**PG-8.3**: Compare `ROWS` vs `RANGE` in a running sum on `sales.orders` where two orders share the same date.

---

## Next Chapter

→ **Chapter 9 — Advanced SQL Techniques**: Subqueries, CTEs, recursive CTEs, views, stored procedures, and triggers — the tools that make SQL a complete programming environment.
