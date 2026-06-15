# Chapter 11 - AI & SQL

---

## Chapter Overview

AI tools have fundamentally changed how SQL is written, debugged, and optimised. This chapter covers the practical intersection of AI and SQL: using AI assistants to write queries, debug errors, optimise performance, generate test data, and integrate SQL with Python for data analysis workflows.

This is not a theoretical chapter about "the future of AI." It is a practical guide to using AI tools effectively - and critically - in your SQL work today.

### Prerequisites

- Completed Chapters 1–10
- Access to an AI tool: ChatGPT, Claude, GitHub Copilot, or similar
- (Optional) Python 3.10+ for the integration sections

### Reference Scripts

`27_AI_and_SQL.sql`

```sql
USE salesdb;
```

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Craft effective prompts for AI to write SQL queries
2. Use AI to debug SQL errors and optimise query performance
3. Use AI to explain, document, and format SQL code
4. Generate test datasets using AI
5. Connect Python to MySQL using `mysql-connector-python`
6. Execute SQL queries from Python and load results into Pandas DataFrames
7. Critically evaluate AI-generated SQL for correctness

---

## 11.1 AI Prompt Patterns for SQL

### 11.1.1 Solving SQL Tasks

The most common use: describe what you need, let AI write the query.

**Prompt template**:
```
I have a MySQL database called salesdb with the following tables:
- customers (customerid, firstname, lastname, country, score)
- orders (orderid, productid, customerid, salespersonid, orderdate, shipdate, orderstatus, quantity, sales)
- products (productid, product, category, price)
- employees (employeeid, firstname, lastname, department, birthdate, gender, salary, managerid)

Write a query that: [your requirement]
```

**Key principle**: Always provide the schema. AI cannot guess your table and column names.

**Example**:
```
Write a query that finds the top 3 customers by total order value, 
showing their name, country, total orders, and total sales.
Include customers who have no orders (with 0 totals).
```

### 11.1.2 Debugging SQL Errors

**Prompt template**:
```
I'm running this MySQL query and getting the following error:

Query:
[paste your query]

Error:
[paste the error message]

What's wrong and how do I fix it?
```

### 11.1.3 Optimising Performance

**Prompt template**:
```
This MySQL query is running slowly on a table with 2.8 million rows.
Here is the query and the EXPLAIN output:

Query:
[paste query]

EXPLAIN output:
[paste EXPLAIN results]

How can I optimise this query? Suggest indexes and query rewrites.
```

### 11.1.4 Explaining Queries

When you encounter a complex query written by someone else:

```
Explain this MySQL query step by step. 
What does each part do? What will the output look like?

[paste the complex query]
```

### 11.1.5 Code Formatting and Documentation

```
Reformat this SQL query to follow best practices:
- Uppercase keywords
- One clause per line
- Meaningful aliases
- Add comments explaining the business logic

[paste messy query]
```

### 11.1.6 Generating Test Data

```
Generate MySQL INSERT statements to create 20 rows of realistic 
test data for a table called 'customers' with columns:
customer_id (INT AUTO_INCREMENT), name (VARCHAR), email (VARCHAR), 
signup_date (DATE), total_purchases (DECIMAL).

Use realistic but fictional data.
```

### 11.1.7 Concept Explanations

```
Explain the difference between RANK() and DENSE_RANK() in MySQL.
Give me a concrete example using a table of sales data.
Show the output for both functions side by side.
```

### 11.1.8 Interview Preparation

```
Give me 10 intermediate-level SQL interview questions 
with detailed answers. Focus on JOINs, window functions, 
and query optimisation.
```

---

## 11.2 What to Trust vs Verify

AI-generated SQL is useful but not infallible. Here is what to always check:

### 11.2.1 Always Verify

| Risk | Example | Verification |
|---|---|---|
| **Wrong table/column names** | AI guesses `customer_name` when it is `firstname` | Check against `DESCRIBE table` |
| **Wrong JOIN type** | AI uses INNER JOIN when you need LEFT JOIN | Think about whether you want to lose unmatched rows |
| **Incorrect aggregation** | AI groups by wrong column | Check if the GROUP BY columns match your intent |
| **Dialect mismatch** | AI writes PostgreSQL syntax when you need MySQL | Look for `SERIAL`, `ILIKE`, `::` casting, schema-qualified names |
| **Performance** | AI writes a correlated subquery that scans 2.8M rows | Run EXPLAIN before deploying |

### 11.2.2 The "Run-then-Read" Workflow

1. Describe your requirement to the AI
2. Get the query
3. **Read it before running** - does the logic make sense?
4. Run it on a **small dataset** or with `LIMIT`
5. Verify the output against known data
6. Only then run on production data

---

## 11.3 SQL and Python Integration

### 11.3.1 Why Python + SQL?

- SQL excels at querying and transforming data in the database
- Python excels at analysis, visualisation, machine learning, and automation
- Together they form the core toolkit of a modern data analyst

### 11.3.2 Connecting Python to MySQL

Install the connector:
```bash
pip install mysql-connector-python
```

Basic connection:
```python
import mysql.connector

# Connect to MySQL
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='salesdb'
)

# Create a cursor
cursor = conn.cursor()

# Execute a query
cursor.execute("SELECT * FROM customers")

# Fetch results
rows = cursor.fetchall()
for row in rows:
    print(row)

# Clean up
cursor.close()
conn.close()
```

### 11.3.3 Loading SQL Results into Pandas

```python
import pandas as pd
import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='salesdb'
)

# Read SQL directly into a DataFrame
df = pd.read_sql("""
    SELECT 
        c.firstname,
        c.country,
        COUNT(o.orderid) AS order_count,
        SUM(o.sales) AS total_sales
    FROM customers c
    LEFT JOIN orders o ON c.customerid = o.customerid
    GROUP BY c.customerid, c.firstname, c.country
""", conn)

print(df)
conn.close()
```

Output:
```
  firstname  country  order_count  total_sales
0    Jossef  Germany            3        110.0
1     Kevin      USA            3         55.0
2      Mary      USA            3        125.0
3      Mark  Germany            1         90.0
4      Anna      USA            0          NaN
```

### 11.3.4 Using SQLAlchemy (Recommended for Production)

```python
from sqlalchemy import create_engine
import pandas as pd

# Create engine (connection string format)
engine = create_engine('mysql+mysqlconnector://root:password@localhost/salesdb')

# Read SQL into DataFrame
df = pd.read_sql("SELECT * FROM orders", engine)

# Write DataFrame back to MySQL
df.to_sql('orders_backup', engine, if_exists='replace', index=False)
```

### 11.3.5 Parameterised Queries - Preventing SQL Injection

```python
# ❌ NEVER do this (SQL injection vulnerability)
country = "Germany"
cursor.execute(f"SELECT * FROM customers WHERE country = '{country}'")

# ✅ Use parameterised queries
cursor.execute("SELECT * FROM customers WHERE country = %s", (country,))
```

---

## 11.4 SQL for Feature Engineering

When preparing data for machine learning models, SQL is often used to create features:

```sql
-- Feature engineering for a customer churn model
SELECT 
    c.customerid,
    c.country,
    c.score,
    COUNT(o.orderid) AS total_orders,
    COALESCE(SUM(o.sales), 0) AS lifetime_value,
    COALESCE(AVG(o.sales), 0) AS avg_order_value,
    MIN(o.orderdate) AS first_order_date,
    MAX(o.orderdate) AS last_order_date,
    DATEDIFF(CURDATE(), MAX(o.orderdate)) AS days_since_last_order,
    CASE
        WHEN DATEDIFF(CURDATE(), MAX(o.orderdate)) > 90 THEN 1
        ELSE 0
    END AS is_churned
FROM customers c
LEFT JOIN orders o ON c.customerid = o.customerid
GROUP BY c.customerid, c.country, c.score;
```

This single query creates 8 features from raw transactional data - ready to load into a Python ML pipeline.

---

## 11.5 Cloud SQL Platforms

Modern data analytics often happens in cloud data warehouses. The SQL is the same; the platform differs:

| Platform | Provider | Key Difference |
|---|---|---|
| **BigQuery** | Google Cloud | Serverless, uses standard SQL with extensions, charges per query scan |
| **Redshift** | AWS | PostgreSQL-based, columnar storage, uses distribution keys |
| **Snowflake** | Multi-cloud | Separates compute and storage, auto-scaling, time travel queries |
| **Azure Synapse** | Microsoft | T-SQL based, integrates with Power BI |

Your MySQL and PostgreSQL skills transfer directly. The core SQL is identical - only platform-specific extensions (partitioning syntax, data types, optimisation hints) differ.

---

## 11.6 Ethics and Responsible Data Handling

As a data analyst, you have access to sensitive information. Handle it responsibly:

| Principle | Action |
|---|---|
| **Data privacy** | Never include personally identifiable information (PII) in AI prompts. Anonymise data before sharing. |
| **Bias awareness** | Analytical queries can reinforce bias. If your segmentation excludes certain demographics, question why. |
| **Data minimisation** | Query only the data you need. Do not extract entire customer tables "just in case." |
| **Access control** | Use views and GRANT/REVOKE to limit who can see what. Not everyone needs access to salary data. |
| **Audit trails** | Log who queries what. Use the trigger techniques from Chapter 9. |

---

## Practice Exercises

### Beginner

**Exercise 11.1**: Use an AI tool to write a query that finds the most popular product (most orders) in `salesdb`. Verify the output.

**Exercise 11.2**: Give an AI tool an intentionally broken query and ask it to fix it. Verify the fix.

### Intermediate

**Exercise 11.3**: Ask an AI tool to explain the recursive CTE from Chapter 9 step by step. Evaluate the quality of the explanation.

**Exercise 11.4**: Write a Python script that connects to MySQL, runs `SELECT * FROM customers`, and prints the results.

**Exercise 11.5**: Use `pd.read_sql()` to load the orders data into a Pandas DataFrame. Calculate the average sales per month using Pandas.

### Challenge

**Exercise 11.6**: Write a complete feature engineering query for the `salesdb` that creates a customer profile with at least 8 calculated features. Load it into a Pandas DataFrame.

**Exercise 11.7**: Use AI to generate 50 rows of realistic test data for a new `reviews` table (review_id, customer_id, product_id, rating, review_text, review_date). Insert it into MySQL, then query it.

---

## Key Takeaways

1. **AI accelerates SQL work** but does not replace understanding. Use it for drafting, debugging, and optimising - but always verify the output.

2. **Provide schema context in prompts.** AI cannot guess your table and column names. The better the context, the better the output.

3. **Python + SQL is the modern data analyst's toolkit.** `pd.read_sql()` bridges database queries into DataFrames for analysis and visualisation.

4. **Use parameterised queries in Python.** Never concatenate user input into SQL strings - this creates SQL injection vulnerabilities.

5. **Cloud SQL platforms** (BigQuery, Redshift, Snowflake) use the same SQL fundamentals you have learned. Your skills are portable.

6. **Handle data ethically.** Protect privacy, question bias, and limit access to sensitive information.

---

## Next Chapter

→ **Chapter 12 - SQL Projects**: Put everything together. Six guided capstone projects that test every concept from the course.
