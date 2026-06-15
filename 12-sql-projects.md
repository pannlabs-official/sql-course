# Chapter 12 — SQL Projects

---

## Chapter Overview

This is where everything comes together. Six guided capstone projects, each designed to test a different combination of skills from the course. These are not toy exercises — they simulate real analytical tasks you would encounter in a professional setting.

Each project includes: business context, requirements, the databases used, a guided step-by-step solution, and extension challenges for trainees who want to go further.

### Databases Used

All projects draw from the databases you loaded during setup. Each project specifies which database(s) it uses.

---

## Project 1 — Sales Performance Dashboard

**Databases**: `salesdb`  
**Skills Tested**: JOINs, aggregation, window functions, CASE, date functions

### Business Context

The sales manager wants a comprehensive dashboard report showing key performance indicators for the sales team. This report will be generated monthly and used in executive meetings.

### Requirements

Build a single query (or a series of queries) that produces:

1. **Total Revenue, Order Count, and Average Order Value** — overall
2. **Revenue by Product** — which products generate the most revenue
3. **Revenue by Month** — monthly trend
4. **Top Salesperson** — ranked by total sales
5. **Customer Rankings** — customers ranked by lifetime value
6. **Month-over-Month Growth** — percentage change from previous month

### Guided Solution

#### Step 1: Overall KPIs

```sql
SELECT 
    COUNT(*) AS total_orders,
    SUM(sales) AS total_revenue,
    ROUND(AVG(sales), 2) AS avg_order_value,
    MIN(orderdate) AS first_order,
    MAX(orderdate) AS last_order
FROM orders;
```

#### Step 2: Revenue by Product

```sql
SELECT 
    p.product,
    p.category,
    COUNT(o.orderid) AS order_count,
    SUM(o.sales) AS total_revenue,
    ROUND(SUM(o.sales) * 100.0 / (SELECT SUM(sales) FROM orders), 1) AS pct_of_total
FROM orders o
JOIN products p ON o.productid = p.productid
GROUP BY p.productid, p.product, p.category
ORDER BY total_revenue DESC;
```

#### Step 3: Monthly Revenue Trend

```sql
SELECT 
    DATE_FORMAT(orderdate, '%Y-%m') AS month,
    COUNT(*) AS orders,
    SUM(sales) AS revenue
FROM orders
GROUP BY DATE_FORMAT(orderdate, '%Y-%m')
ORDER BY month;
```

#### Step 4: Salesperson Rankings

```sql
SELECT 
    e.firstname AS salesperson,
    e.department,
    COUNT(o.orderid) AS deals_closed,
    SUM(o.sales) AS total_revenue,
    RANK() OVER(ORDER BY SUM(o.sales) DESC) AS rank_num
FROM orders o
JOIN employees e ON o.salespersonid = e.employeeid
GROUP BY e.employeeid, e.firstname, e.department;
```

#### Step 5: Customer Lifetime Value

```sql
SELECT 
    c.firstname,
    c.country,
    COUNT(o.orderid) AS total_orders,
    COALESCE(SUM(o.sales), 0) AS lifetime_value,
    RANK() OVER(ORDER BY COALESCE(SUM(o.sales), 0) DESC) AS customer_rank,
    CASE
        WHEN SUM(o.sales) >= 100 THEN 'Platinum'
        WHEN SUM(o.sales) >= 50 THEN 'Gold'
        ELSE 'Silver'
    END AS tier
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
GROUP BY c.customerid, c.firstname, c.country;
```

#### Step 6: Month-over-Month Growth

```sql
WITH monthly AS (
    SELECT 
        DATE_FORMAT(orderdate, '%Y-%m') AS month,
        SUM(sales) AS revenue
    FROM orders
    GROUP BY DATE_FORMAT(orderdate, '%Y-%m')
)
SELECT 
    month,
    revenue,
    LAG(revenue) OVER(ORDER BY month) AS prev_month_revenue,
    ROUND(
        (revenue - LAG(revenue) OVER(ORDER BY month)) * 100.0 
        / LAG(revenue) OVER(ORDER BY month), 1
    ) AS growth_pct
FROM monthly;
```

### Extension Challenges

- Add a year-over-year comparison (using `orders_archive`)
- Calculate the customer retention rate: what percentage of Q1 customers also ordered in Q2?
- Create a view for each dashboard component so analysts can query `v_monthly_revenue` directly

---

## Project 2 — Customer Segmentation (RFM Analysis)

**Databases**: `sql_store`  
**Skills Tested**: Aggregation, date functions, CASE, NTILE, CTEs

### Business Context

Marketing wants to segment customers into groups based on their purchasing behaviour using **RFM (Recency, Frequency, Monetary)** analysis — a proven technique used by retail, e-commerce, and SaaS companies.

### Requirements

For each customer, calculate:
- **Recency**: Days since their last order (lower = better)
- **Frequency**: Total number of orders (higher = better)
- **Monetary**: Total amount spent (higher = better)

Then assign each customer to a segment based on their RFM scores.

### Guided Solution

```sql
USE sql_store;

-- Step 1: Calculate RFM values
WITH rfm_raw AS (
    SELECT 
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        DATEDIFF(CURDATE(), MAX(o.order_date)) AS recency_days,
        COUNT(o.order_id) AS frequency,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS monetary
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    GROUP BY c.customer_id, c.first_name, c.last_name
),

-- Step 2: Score each dimension (1-5 quintiles)
rfm_scored AS (
    SELECT 
        customer_id,
        customer_name,
        recency_days,
        frequency,
        monetary,
        NTILE(5) OVER(ORDER BY recency_days DESC) AS r_score,   -- Lower recency = higher score
        NTILE(5) OVER(ORDER BY frequency ASC) AS f_score,
        NTILE(5) OVER(ORDER BY monetary ASC) AS m_score
    FROM rfm_raw
    WHERE recency_days IS NOT NULL  -- Exclude customers with no orders
)

-- Step 3: Assign segments
SELECT 
    customer_id,
    customer_name,
    recency_days,
    frequency,
    ROUND(monetary, 2) AS monetary,
    r_score,
    f_score,
    m_score,
    CONCAT(r_score, f_score, m_score) AS rfm_combined,
    CASE
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 4 AND f_score <= 2 THEN 'New Customers'
        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
        WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost'
        ELSE 'Potential'
    END AS segment
FROM rfm_scored
ORDER BY monetary DESC;
```

### Extension Challenges

- Visualise the segment distribution: how many customers in each segment?
- Create a stored procedure that re-runs the RFM analysis and stores results in a permanent table
- Compare segments across different time periods

---

## Project 3 — Employee Analytics

**Databases**: `sql_hr`, `employees` (large)  
**Skills Tested**: Self-JOINs, recursive CTEs, window functions, aggregation, subqueries

### Requirements

1. **Org chart**: Display the full employee hierarchy from `sql_hr` using a recursive CTE
2. **Salary analysis**: For the `employees` database, calculate:
   - Average salary by department
   - Salary distribution (quartiles)
   - Highest-paid employee in each department
   - Salary trends over time (using the `salaries` table)
3. **Manager span of control**: How many direct reports does each manager have?

### Guided Solution

#### Org Chart (sql_hr)

```sql
USE sql_hr;

WITH RECURSIVE hierarchy AS (
    SELECT 
        employee_id,
        first_name,
        last_name,
        job_title,
        salary,
        reports_to,
        0 AS depth
    FROM employees
    WHERE reports_to IS NULL
    
    UNION ALL
    
    SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.job_title,
        e.salary,
        e.reports_to,
        h.depth + 1
    FROM employees e
    JOIN hierarchy h ON e.reports_to = h.employee_id
)
SELECT 
    CONCAT(REPEAT('  ', depth), first_name, ' ', last_name) AS org_tree,
    job_title,
    FORMAT(salary, 0) AS salary
FROM hierarchy
ORDER BY depth, salary DESC;
```

#### Salary Quartiles (employees database)

```sql
USE employees;

SELECT 
    d.dept_name,
    COUNT(*) AS employee_count,
    FORMAT(MIN(s.salary), 0) AS min_salary,
    FORMAT(AVG(s.salary), 0) AS avg_salary,
    FORMAT(MAX(s.salary), 0) AS max_salary
FROM employees e
JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
JOIN departments d ON de.dept_no = d.dept_no
JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
GROUP BY d.dept_no, d.dept_name
ORDER BY AVG(s.salary) DESC;
```

### Extension Challenges

- Find employees who have changed departments
- Calculate the average time between salary increases
- Identify employees who have never received a raise

---

## Project 4 — Financial Reporting

**Databases**: `sql_invoicing`  
**Skills Tested**: JOINs, date functions, aggregation, CASE, HAVING

### Requirements

1. **Invoice aging report**: Classify invoices as Current (< 30 days), Overdue (30-90 days), or Severely Overdue (> 90 days)
2. **Payment analysis**: Which clients pay on time? Which are chronically late?
3. **Revenue recognition**: Monthly revenue breakdown with payment status
4. **Outstanding balances**: Total unpaid amount per client

### Guided Solution

```sql
USE sql_invoicing;

-- Outstanding balances per client
SELECT 
    c.name AS client,
    COUNT(i.invoice_id) AS total_invoices,
    SUM(i.invoice_total) AS total_billed,
    SUM(i.payment_total) AS total_paid,
    SUM(i.invoice_total - i.payment_total) AS outstanding_balance,
    ROUND(
        SUM(i.payment_total) * 100.0 / SUM(i.invoice_total), 1
    ) AS pct_paid
FROM clients c
JOIN invoices i ON c.client_id = i.client_id
GROUP BY c.client_id, c.name
ORDER BY outstanding_balance DESC;
```

```sql
-- Invoice aging
SELECT 
    c.name AS client,
    i.number AS invoice_number,
    i.invoice_date,
    i.due_date,
    i.invoice_total,
    i.payment_total,
    i.invoice_total - i.payment_total AS balance,
    DATEDIFF(CURDATE(), i.due_date) AS days_past_due,
    CASE
        WHEN i.payment_total >= i.invoice_total THEN 'Paid'
        WHEN DATEDIFF(CURDATE(), i.due_date) <= 0 THEN 'Current'
        WHEN DATEDIFF(CURDATE(), i.due_date) BETWEEN 1 AND 30 THEN 'Overdue'
        WHEN DATEDIFF(CURDATE(), i.due_date) BETWEEN 31 AND 90 THEN 'Late'
        ELSE 'Severely Overdue'
    END AS aging_status
FROM invoices i
JOIN clients c ON i.client_id = c.client_id
WHERE i.payment_total < i.invoice_total
ORDER BY days_past_due DESC;
```

### Extension Challenges

- Calculate the average days-to-payment per client
- Create a stored procedure that generates the aging report for a specific date
- Build a trigger that sends a notification (insert into a notifications table) when an invoice becomes overdue

---

## Project 5 — Data Quality Audit

**Databases**: `salesdb` (orders_archive specifically)  
**Skills Tested**: Self-JOINs, aggregation, HAVING, NOT EXISTS, CASE

### Requirements

1. **Duplicate detection**: Find duplicate `orderid` values in `orders_archive`
2. **Orphan records**: Find orders referencing non-existent customers or products
3. **Data consistency**: Find records where `shipdate < orderdate` (shipped before ordered)
4. **NULL analysis**: Report on NULL frequency per column
5. **Anomaly detection**: Find orders with `quantity = 0` but `sales > 0`

### Guided Solution

```sql
USE salesdb;

-- Duplicate orderids in archive
SELECT 
    orderid,
    COUNT(*) AS occurrences
FROM orders_archive
GROUP BY orderid
HAVING COUNT(*) > 1;

-- Orphan records: orders with non-existent customers
SELECT o.*
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM customers c WHERE c.customerid = o.customerid
);

-- Logical inconsistencies
SELECT 
    orderid, orderdate, shipdate,
    DATEDIFF(shipdate, orderdate) AS days_to_ship
FROM orders
WHERE shipdate < orderdate;

-- NULL analysis
SELECT 
    COUNT(*) AS total_rows,
    SUM(CASE WHEN shipaddress IS NULL THEN 1 ELSE 0 END) AS null_shipaddress,
    SUM(CASE WHEN billaddress IS NULL THEN 1 ELSE 0 END) AS null_billaddress,
    ROUND(SUM(CASE WHEN shipaddress IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS pct_null_ship,
    ROUND(SUM(CASE WHEN billaddress IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS pct_null_bill
FROM orders;

-- Anomaly: zero quantity with non-zero sales
SELECT *
FROM orders
WHERE quantity = 0 AND sales > 0;
```

### Extension Challenges

- Build a complete data quality scorecard that rates each table on completeness, consistency, and accuracy
- Create a stored procedure that runs all quality checks and inserts results into a `dq_results` table with timestamps
- Write a deduplication query that keeps only the latest version of duplicate records

---

## Project 6 — ETL Pipeline (Mini)

**Databases**: CSV files from `assets/`, a new staging database  
**Skills Tested**: DDL, DML, data loading, transformations, CTEs, views

### Business Context

You are building a simple ETL (Extract, Transform, Load) pipeline that:
1. **Extracts** data from CSV files
2. **Transforms** it (cleaning, standardising, enriching)
3. **Loads** it into a reporting-ready schema

### Requirements

1. Create a `staging_db` database with raw staging tables
2. Load the CSV files (Customers.csv, Orders.csv, Products.csv, Employees.csv) into staging tables
3. Transform the data:
   - Trim whitespace from all string columns
   - Standardise country names (e.g., 'usa' → 'United States')
   - Calculate derived columns (full name, order age, revenue)
   - Handle NULLs with defaults
4. Load into clean reporting tables
5. Create views for common analytical queries

### Guided Solution

```sql
-- Step 1: Create staging database
CREATE DATABASE IF NOT EXISTS staging_db;
USE staging_db;

-- Step 2: Create staging tables (raw — matches CSV structure exactly)
CREATE TABLE stg_customers (
    customerid INT,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    country VARCHAR(50),
    score INT
);

-- Step 3: Load CSVs (use Workbench Import Wizard or LOAD DATA INFILE)

-- Step 4: Transform and load into clean tables
CREATE TABLE dim_customers AS
SELECT 
    customerid,
    TRIM(firstname) AS first_name,
    TRIM(COALESCE(lastname, 'Unknown')) AS last_name,
    CONCAT_WS(' ', TRIM(firstname), TRIM(COALESCE(lastname, ''))) AS full_name,
    CASE TRIM(UPPER(country))
        WHEN 'USA' THEN 'United States'
        WHEN 'US' THEN 'United States'
        WHEN 'GERMANY' THEN 'Germany'
        WHEN 'UK' THEN 'United Kingdom'
        ELSE TRIM(country)
    END AS country,
    COALESCE(score, 0) AS score,
    CASE
        WHEN score >= 800 THEN 'Platinum'
        WHEN score >= 500 THEN 'Gold'
        WHEN score >= 200 THEN 'Silver'
        ELSE 'Bronze'
    END AS tier,
    NOW() AS loaded_at
FROM stg_customers;

-- Step 5: Create reporting views
CREATE VIEW v_customer_summary AS
SELECT 
    tier,
    COUNT(*) AS customer_count,
    AVG(score) AS avg_score
FROM dim_customers
GROUP BY tier
ORDER BY avg_score DESC;
```

### Extension Challenges

- Add error handling: log rows that fail validation into an `etl_errors` table
- Implement incremental loading: only process new/changed records
- Schedule the ETL to run on a set cadence using MySQL Events

---

## Grading Rubric

Each project can be evaluated on these criteria:

| Criterion | Weight | Description |
|---|---|---|
| **Correctness** | 40% | Does the query return the correct results? |
| **Completeness** | 20% | Are all requirements addressed? |
| **Code Quality** | 20% | Is the SQL well-formatted, commented, and using appropriate techniques? |
| **Performance** | 10% | Does the query use indexes and avoid unnecessary scans? |
| **Extension** | 10% | Did the trainee attempt any extension challenges? |

---

## Key Takeaways

1. **Real SQL work combines many concepts.** Every project in this chapter uses JOINs, aggregation, CASE, date functions, and CTEs together. Mastery means combining tools fluently.

2. **Start with the question, not the query.** Define what you need to know before writing SQL. The business requirement drives the technical solution.

3. **Build incrementally.** Write your query in stages: start with FROM, add JOINs, add WHERE, add GROUP BY, add window functions. Test at each stage.

4. **Verify against known data.** Always spot-check your results against rows you can manually verify. If your total revenue is $380 and you know it should be $380, your query is correct.

5. **Document your work.** Comment your SQL. Future-you will thank present-you when you revisit this query in 6 months.

---

## Course Complete

Congratulations. You have worked through 12 chapters covering the full spectrum of SQL:

- Fundamentals (SELECT, WHERE, ORDER BY)
- Data architecture (DDL, DML, transactions)
- Data combination (JOINs, UNION, INTERSECT)
- Data transformation (functions, CASE)
- Advanced analytics (window functions, CTEs, subqueries)
- Performance (indexes, EXPLAIN, optimization)
- Modern workflows (AI, Python, cloud platforms)
- Applied projects (dashboards, RFM, ETL)

You are now equipped with production-grade SQL skills. The next step is practice — not in exercises, but on real data, real problems, and real deadlines.

**Keep writing SQL. Keep breaking queries. Keep fixing them.**
