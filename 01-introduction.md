# Chapter 1 - Introduction

---

## Chapter Overview

This chapter answers the questions that every trainee has on day one: *What is a database? What is SQL? Why should I learn this?* - and then immediately puts you in front of a working MySQL environment running real queries.

We do not spend the entire chapter on theory. By the end of this chapter, you will have installed MySQL, loaded two databases, written and executed your first SQL queries, and understood the mental model that governs how SQL processes every query you will ever write.

### Prerequisites

- Completed the Database Setup Guide (`00-database-setup-guide.md`)
- MySQL Workbench open and connected to your local MySQL server
- `MyDatabase` and `Parks_and_Recreation` databases loaded

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Explain what a relational database is and why it is the dominant model for structured data
2. Describe what SQL is, where it came from, and why it remains the universal language of data
3. Distinguish between different database engines (MySQL, PostgreSQL, SQL Server, SQLite) and when each is used
4. Navigate MySQL Workbench to connect, open query tabs, and execute queries
5. Write basic `SELECT` statements to retrieve data from tables
6. Explain the SQL execution order and why it differs from the writing order

---

## 1.1 What Is a Database?

### 1.1.1 The Problem Databases Solve

Before databases existed, data lived in flat files - spreadsheets, text files, paper ledgers. This worked fine when you had 50 customers. It fails catastrophically when you have 50,000.

The problems with flat files:

| Problem | Example |
|---|---|
| **Data duplication** | Customer "Kevin Brown" appears in 47 different invoice rows, each with his address copied. If he moves, you update 47 rows - or miss one. |
| **No data integrity** | Nothing stops someone from entering "January 32nd" as a date, or "-500" as a quantity. |
| **No concurrent access** | Two people editing the same spreadsheet at once leads to conflicts and data loss. |
| **No relationships** | How do you connect a customer to their orders to the products they bought? In a spreadsheet, you either cram everything into one mega-row or maintain multiple sheets with no enforced link. |
| **Poor query performance** | Finding "all customers from Germany who ordered more than 3 items in Q1 2025" in a spreadsheet means scanning every row manually. |

A **database** solves all of these. It is a structured, organised collection of data that is stored, managed, and accessed through software called a **Database Management System (DBMS)**.

### 1.1.2 Relational Databases

The most widely used database model is the **relational model**, proposed by Edgar F. Codd at IBM in 1970. His insight was elegant: store data in **tables** (he called them "relations"), where:

- Each **table** represents one type of entity (customers, orders, products)
- Each **row** (record/tuple) is one instance of that entity (one specific customer)
- Each **column** (field/attribute) is one property of that entity (customer's name, country, score)
- Tables are **linked** through shared columns (a customer's ID appears in both the `customers` table and the `orders` table)

This linking - the "relational" part - is the key innovation. Instead of duplicating "Kevin Brown, USA" across 47 rows, you store Kevin once in the `customers` table with an ID of `2`, and every order he places simply references `customer_id = 2`.

**Example**: Here is how the `MyDatabase` you loaded organises customer and order data across two linked tables:

**`customers` table:**

| id | first_name | country | score |
|---|---|---|---|
| 1 | Maria | Germany | 350 |
| 2 | John | USA | 900 |
| 3 | Georg | UK | 750 |
| 4 | Martin | Germany | 500 |
| 5 | Peter | USA | 0 |

**`orders` table:**

| order_id | customer_id | order_date | sales |
|---|---|---|---|
| 1001 | 1 | 2021-01-11 | 35 |
| 1002 | 2 | 2021-04-05 | 15 |
| 1003 | 3 | 2021-06-18 | 20 |
| 1004 | 6 | 2021-08-31 | 10 |

Notice: `customer_id` in the orders table corresponds to `id` in the customers table. Customer `1` (Maria) placed order `1001`. Customer `6` placed order `1004` - but there is no customer with `id = 6` in our customers table. This kind of inconsistency is called an **orphan record**, and we will learn how to prevent it with foreign keys in Chapter 3.

### 1.1.3 Relational vs Non-Relational Databases

Not all databases are relational. Here is a quick landscape:

| Type | Model | Examples | Best For |
|---|---|---|---|
| **Relational (SQL)** | Tables with rows and columns, linked by keys | MySQL, PostgreSQL, SQL Server, Oracle, SQLite | Structured data, transactional systems, analytics, financial data, anything where data integrity matters |
| **Document** | JSON-like documents, nested data | MongoDB, CouchDB | Flexible schemas, content management, user profiles |
| **Key-Value** | Simple key → value pairs | Redis, DynamoDB | Caching, session storage, real-time leaderboards |
| **Graph** | Nodes and edges (relationships) | Neo4j, Amazon Neptune | Social networks, recommendation engines, fraud detection |
| **Column-Family** | Columns grouped into families | Cassandra, HBase | Massive-scale write-heavy workloads, time-series data |

**For data analytics, relational databases dominate.** The structured nature of tabular data, the mathematical foundation of relational algebra, and the 50+ years of optimisation that have gone into SQL engines make them the default choice for analytical workloads. This course focuses exclusively on relational databases.

---

## 1.2 What Is SQL?

### 1.2.1 Definition

**SQL** (Structured Query Language) is the standard language for interacting with relational databases. It is:

- **Declarative**: You tell the database *what* you want, not *how* to get it. You write `SELECT * FROM customers WHERE country = 'Germany'` and the database figures out the most efficient way to find those rows.
- **Standardised**: The ANSI/ISO SQL standard defines the core language. All major database engines implement it (with their own extensions and variations).
- **Universal**: SQL is the one language that works across MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Redshift, Snowflake, and dozens of other systems. The syntax varies slightly between engines, but the core concepts are identical.

### 1.2.2 A Brief History

| Year | Event |
|---|---|
| 1970 | Edgar F. Codd publishes "A Relational Model of Data for Large Shared Data Banks" at IBM |
| 1974 | IBM develops SEQUEL (Structured English Query Language), later renamed SQL |
| 1979 | Oracle releases the first commercial SQL-based database |
| 1986 | SQL becomes an ANSI standard (SQL-86) |
| 1992 | SQL-92 standard introduces JOINs, CASE expressions, and other major features |
| 1999 | SQL:1999 adds regular expressions, recursive queries, triggers |
| 2003 | SQL:2003 adds window functions, XML support |
| 2011 | SQL:2011 adds temporal data handling |
| 2016 | SQL:2016 adds JSON support |
| 2023 | SQL:2023 adds graph pattern matching, property graph queries |

SQL has been the dominant data language for over 40 years. It has outlived hundreds of "SQL killers." Every data analyst, data engineer, data scientist, and backend developer is expected to know it.

### 1.2.3 What Can SQL Do?

SQL is divided into several sub-languages, each handling a different aspect of database work:

| Sub-Language | What It Does | Key Commands | Course Chapter |
|---|---|---|---|
| **DQL** (Data Query Language) | Read/retrieve data | `SELECT` | Ch. 2, 5, 6, 7, 8 |
| **DDL** (Data Definition Language) | Create/modify database structures | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` | Ch. 3 |
| **DML** (Data Manipulation Language) | Insert/update/delete data | `INSERT`, `UPDATE`, `DELETE` | Ch. 4 |
| **DCL** (Data Control Language) | Manage permissions | `GRANT`, `REVOKE` | Referenced in Ch. 10 |
| **TCL** (Transaction Control Language) | Manage transactions | `BEGIN`, `COMMIT`, `ROLLBACK` | Ch. 4 |

---

## 1.3 Database Engines

A **database engine** (or DBMS - Database Management System) is the software that stores, manages, and serves the data. SQL is the language; the engine is the machine that interprets and executes it.

### 1.3.1 Engines We Use in This Course

| Engine | Role in This Course | Key Characteristics |
|---|---|---|
| **MySQL** | Primary | Most popular open-source database. Default choice for web applications, widely used in data analytics. Owned by Oracle. Uses `LIMIT` for pagination, `IFNULL` for null handling, `AUTO_INCREMENT` for auto-generated IDs. |
| **PostgreSQL** | Secondary (assignments) | Most advanced open-source database. Known for strict SQL standard compliance, powerful extensions (PostGIS for geospatial, full-text search), and features MySQL lacks (e.g., `FULL OUTER JOIN`, `INTERSECT`, `EXCEPT` natively). Uses `SERIAL` for auto-generated IDs, `ILIKE` for case-insensitive matching. |

### 1.3.2 Other Engines You Should Know About

| Engine | When You'd Use It |
|---|---|
| **SQL Server** | Microsoft ecosystem, enterprise environments, .NET applications |
| **Oracle** | Large enterprise, banking, telecommunications - very expensive licensing |
| **SQLite** | Embedded databases, mobile apps, browser storage, prototyping - no separate server process |
| **BigQuery** | Google Cloud analytics - handles petabytes, serverless |
| **Redshift** | AWS analytics - columnar storage optimised for analytical queries |
| **Snowflake** | Cloud-native data warehouse - separates compute and storage |

### 1.3.3 MySQL vs PostgreSQL - Key Differences

Since this course uses both engines, here is a quick reference of the most common syntax differences you will encounter:

| Feature | MySQL | PostgreSQL |
|---|---|---|
| Auto-increment ID | `INT AUTO_INCREMENT` | `SERIAL` or `GENERATED ALWAYS AS IDENTITY` |
| Limit results | `LIMIT 5` | `LIMIT 5` or `FETCH FIRST 5 ROWS ONLY` |
| String concatenation | `CONCAT(a, b)` | `a \|\| b` or `CONCAT(a, b)` |
| Case-insensitive LIKE | `LIKE` (case-insensitive by default) | `ILIKE` (case-insensitive) or `LIKE` (case-sensitive) |
| Current timestamp | `NOW()` | `NOW()` or `CURRENT_TIMESTAMP` |
| Boolean type | `TINYINT(1)` or `BOOLEAN` (alias) | Native `BOOLEAN` |
| Null-safe comparison | `<=>` | `IS NOT DISTINCT FROM` |
| Upsert | `INSERT ... ON DUPLICATE KEY UPDATE` | `INSERT ... ON CONFLICT ... DO UPDATE` |
| Schema support | Limited (database = schema) | Full schema support (`schema.table`) |

You do not need to memorise this table now. We will revisit each difference as it becomes relevant in later chapters.

---

## 1.4 Navigating MySQL Workbench

MySQL Workbench is the GUI tool you will use to write and execute SQL queries throughout this course. Let us get familiar with its key areas.

### 1.4.1 The Interface

When you open a connection in MySQL Workbench, you see:

1. **Navigator Panel** (left side):
   - **Schemas tab**: Shows all databases on your server. Expand a database to see its tables, views, stored procedures.
   - **Administration tab**: Server settings, user management (not needed for this course).

2. **Query Tab** (centre):
   - This is where you write SQL queries.
   - You can have multiple query tabs open at once (like browser tabs).
   - Each tab operates independently.

3. **Output Panel** (bottom):
   - **Result Grid**: Shows query results as a table.
   - **Action Output**: Shows execution status, row counts, errors, and timing.

### 1.4.2 Essential Operations

**Opening a new query tab**: `Ctrl+T` (or File → New Query Tab)

**Executing a query**: 
- Execute the entire script: `Ctrl+Shift+Enter`
- Execute only the selected/current statement: `Ctrl+Enter`

**Switching databases**: Either run `USE database_name;` in the query tab, or double-click the database name in the Schemas panel (it becomes bold when active).

**Commenting code**:
- Single-line comment: `-- this is a comment`
- Multi-line comment: `/* this is a multi-line comment */`
- Toggle comment: Select lines and press `Ctrl+/`

### 1.4.3 A Critical Habit: Saving Your Scripts

Every query you write should be saved as a `.sql` file. MySQL Workbench does not auto-save query tabs. If Workbench crashes, unsaved queries are gone.

- Save: `Ctrl+S`
- Save As: `Ctrl+Shift+S`
- Recommended: Create a folder for your course scripts (e.g., `My course/my-scripts/`) and save each chapter's work there.

---

## 1.5 Your First Queries

Let us write actual SQL. Open MySQL Workbench, connect to your server, and follow along.

### 1.5.1 Seeing What Databases Exist

```sql
-- List all databases on this MySQL server
SHOW DATABASES;
```

**Expected output** (yours may include additional system databases):

| Database |
|---|
| information_schema |
| MyDatabase |
| Parks_and_Recreation |
| salesdb |
| sql_store |
| sql_hr |
| sql_invoicing |
| sql_inventory |
| employees |
| mysql |
| performance_schema |
| sys |

The system databases (`information_schema`, `mysql`, `performance_schema`, `sys`) are MySQL internals - you do not need to touch them in this course.

### 1.5.2 Switching to a Database

Before querying a table, you must tell MySQL which database you want to work with:

```sql
-- Switch to MyDatabase
USE MyDatabase;
```

This is like opening a folder before accessing files inside it. If you forget `USE`, MySQL will give you: `ERROR 1046 (3D000): No database selected`.

### 1.5.3 Seeing What Tables Exist

```sql
-- List all tables in the current database
SHOW TABLES;
```

**Expected output**:

| Tables_in_MyDatabase |
|---|
| customers |
| orders |

### 1.5.4 Retrieving All Data From a Table

The most fundamental SQL statement: `SELECT * FROM table_name;`

```sql
-- Retrieve all columns and all rows from the customers table
SELECT * FROM customers;
```

**Expected output**:

| id | first_name | country | score |
|---|---|---|---|
| 1 | Maria | Germany | 350 |
| 2 |  John | USA | 900 |
| 3 | Georg | UK | 750 |
| 4 | Martin | Germany | 500 |
| 5 | Peter | USA | 0 |

Breaking this down:
- `SELECT` - the command that says "retrieve data"
- `*` - a wildcard meaning "all columns"
- `FROM customers` - specifies which table to read from
- `;` - terminates the statement (required in MySQL)

> **Note**: Notice the leading space in " John" (row 2). This is intentional in the source data - it represents a common real-world data quality issue. We will learn how to fix this with string functions in Chapter 7.

### 1.5.5 Retrieving Specific Columns

You rarely need all columns. Specifying only the columns you need is faster and clearer:

```sql
-- Retrieve only the name and country columns
SELECT 
    first_name, 
    country 
FROM customers;
```

**Expected output**:

| first_name | country |
|---|---|
| Maria | Germany |
|  John | USA |
| Georg | UK |
| Martin | Germany |
| Peter | USA |

### 1.5.6 Retrieving Data From Another Table

```sql
-- Retrieve all order data
SELECT * FROM orders;
```

**Expected output**:

| order_id | customer_id | order_date | sales |
|---|---|---|---|
| 1001 | 1 | 2021-01-11 | 35 |
| 1002 | 2 | 2021-04-05 | 15 |
| 1003 | 3 | 2021-06-18 | 20 |
| 1004 | 6 | 2021-08-31 | 10 |

### 1.5.7 Trying a Different Database

Let us switch to the Parks and Recreation database and explore:

```sql
-- Switch to the Parks and Recreation database
USE Parks_and_Recreation;

-- See what tables are available
SHOW TABLES;
```

**Expected output**:

| Tables_in_Parks_and_Recreation |
|---|
| employee_demographics |
| employee_salary |
| parks_departments |

```sql
-- Who works in the Parks department?
SELECT 
    first_name, 
    last_name, 
    occupation, 
    salary 
FROM employee_salary;
```

**Expected output**:

| first_name | last_name | occupation | salary |
|---|---|---|---|
| Leslie | Knope | Deputy Director of Parks and Recreation | 75000 |
| Ron | Swanson | Director of Parks and Recreation | 70000 |
| Tom | Haverford | Entrepreneur | 50000 |
| April | Ludgate | Assistant to the Director of Parks and Recreation | 25000 |
| Jerry | Gergich | Office Manager | 50000 |
| Donna | Meagle | Office Manager | 60000 |
| Ann | Perkins | Nurse | 55000 |
| Chris | Traeger | City Manager | 90000 |
| Ben | Wyatt | State Auditor | 70000 |
| Andy | Dwyer | Shoe Shiner and Musician | 20000 |
| Mark | Brendanawicz | City Planner | 57000 |
| Craig | Middlebrooks | Parks Director | 65000 |

You have just queried two different databases. Every database has its own tables, and you switch between them with `USE`.

---

## 1.6 SQL Execution Order - The Most Important Mental Model

This is arguably the most valuable concept in this entire chapter. Most SQL beginners (and many intermediate users) are confused by SQL because they think SQL executes in the order you write it. **It does not.**

### 1.6.1 Writing Order vs Execution Order

**You write SQL like this**:

```
SELECT    ← 1st thing you write
FROM      ← 2nd
WHERE     ← 3rd
GROUP BY  ← 4th
HAVING    ← 5th
ORDER BY  ← 6th
LIMIT     ← 7th
```

**But SQL executes like this**:

```
FROM      ← 1st thing that runs (which table?)
WHERE     ← 2nd (filter rows)
GROUP BY  ← 3rd (group remaining rows)
HAVING    ← 4th (filter groups)
SELECT    ← 5th (choose columns, compute expressions)
DISTINCT  ← 6th (remove duplicates)
ORDER BY  ← 7th (sort results)
LIMIT     ← 8th (restrict number of rows returned)
```

### 1.6.2 Why This Matters

This execution order explains behaviours that otherwise seem bizarre:

**Why you cannot use a column alias in WHERE**:

```sql
-- ❌ This will NOT work
SELECT first_name, score * 2 AS double_score
FROM customers
WHERE double_score > 500;
-- ERROR 1054: Unknown column 'double_score' in 'where clause'
```

The reason: `WHERE` executes before `SELECT`. When MySQL processes the `WHERE` clause, it has not yet created the alias `double_score` - it does not exist yet.

**Why you CAN use a column alias in ORDER BY**:

```sql
-- ✅ This WILL work
SELECT first_name, score * 2 AS double_score
FROM customers
ORDER BY double_score DESC;
```

The reason: `ORDER BY` executes after `SELECT`. By the time MySQL reaches `ORDER BY`, the alias `double_score` has already been defined.

**Why you CAN use a column alias in HAVING (MySQL-specific)**:

```sql
-- ✅ This works in MySQL (not in all engines)
SELECT country, AVG(score) AS avg_score
FROM customers
GROUP BY country
HAVING avg_score > 400;
```

> **MySQL vs PostgreSQL**: MySQL allows aliases in `HAVING` as a convenience extension. PostgreSQL follows the SQL standard more strictly and requires you to repeat the expression: `HAVING AVG(score) > 400`.

### 1.6.3 The Execution Pipeline Visualised

Think of SQL execution as an assembly line:

```
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌───────┐
│  FROM   │ →  │  WHERE  │ →  │ GROUP BY │ →  │ HAVING  │ →  │ SELECT  │ →  │ DISTINCT │ →  │ORDER BY │ →  │ LIMIT │
│         │    │         │    │          │    │         │    │         │    │          │    │         │    │       │
│ Load    │    │ Filter  │    │ Group    │    │ Filter  │    │ Pick    │    │ Remove   │    │ Sort    │    │ Cut   │
│ all rows│    │ rows    │    │ rows     │    │ groups  │    │ columns │    │ dupes    │    │ results │    │ rows  │
└─────────┘    └─────────┘    └──────────┘    └─────────┘    └─────────┘    └──────────┘    └─────────┘    └───────┘
```

Every query follows this pipeline. Even if you only write `SELECT * FROM customers;`, the engine still runs the FROM step (load the `customers` table), then the SELECT step (return all columns). The other steps are simply skipped because you did not include them.

---

## 1.7 Comments in SQL

Comments are lines that SQL ignores. They exist to explain your code to other humans (and to your future self).

### 1.7.1 Single-Line Comments

Everything after `--` on a line is ignored:

```sql
-- This is a single-line comment
SELECT * FROM customers; -- This retrieves all customer data
```

### 1.7.2 Multi-Line Comments

Everything between `/*` and `*/` is ignored, even across multiple lines:

```sql
/* 
   This query retrieves customer data
   from the MyDatabase database.
   Author: [Your Name]
   Date: 2026-06-11
*/
SELECT * FROM customers;
```

### 1.7.3 Using Comments to Disable Code

A powerful debugging technique: wrap a query in `/* */` to temporarily disable it without deleting it:

```sql
/* 
SELECT * FROM orders;
*/
SELECT * FROM customers;
```

Only the `customers` query runs. The `orders` query is "commented out."

---

## 1.8 SQL Syntax Rules

Before moving to Chapter 2, commit these rules to memory:

### 1.8.1 Semicolons

Every SQL statement must end with a semicolon (`;`). Without it, MySQL thinks you are still typing and waits for more input.

```sql
-- ✅ Correct
SELECT * FROM customers;

-- ❌ Will work in MySQL Workbench (single statement), but is bad practice
SELECT * FROM customers
```

When you have multiple statements in one script, semicolons are mandatory:

```sql
-- Two separate queries in one script
SELECT * FROM customers;
SELECT * FROM orders;
```

### 1.8.2 Case Sensitivity

**SQL keywords are case-insensitive.** These all do the same thing:

```sql
SELECT * FROM customers;
select * from customers;
Select * From Customers;
SeLeCt * FrOm CuStOmErS;  -- Please don't do this
```

**Convention in this course**: We write SQL keywords in **UPPERCASE** (`SELECT`, `FROM`, `WHERE`). This makes them visually distinct from table and column names, which stay in lowercase. This is an industry-standard convention, not a MySQL requirement.

**Table and column names**: In MySQL on **Windows and macOS**, table names are case-insensitive. On **Linux**, they are case-sensitive. Column names are always case-insensitive in MySQL. PostgreSQL treats unquoted identifiers as lowercase.

**Best practice**: Always use consistent casing. Treat table and column names as case-sensitive even on platforms where they are not - your code will be portable.

### 1.8.3 Whitespace and Formatting

SQL ignores extra whitespace (spaces, tabs, newlines). These are identical:

```sql
-- Compact (hard to read)
SELECT first_name,country,score FROM customers WHERE country='Germany' ORDER BY score DESC;

-- Expanded (easy to read - this is how we write SQL)
SELECT 
    first_name, 
    country, 
    score 
FROM customers 
WHERE country = 'Germany' 
ORDER BY score DESC;
```

Both produce the same result. The second version is dramatically easier to read, debug, and modify. **Always format your SQL for readability.** You will spend far more time reading SQL than writing it.

### 1.8.4 String Literals

Text values are enclosed in **single quotes**:

```sql
-- ✅ Correct - single quotes for string values
SELECT * FROM customers WHERE country = 'Germany';

-- ❌ Wrong - double quotes are for identifiers (column/table names) in some engines
SELECT * FROM customers WHERE country = "Germany";
```

> **Note**: MySQL actually accepts double quotes for strings by default, but this is non-standard. PostgreSQL does not. Use single quotes. Always.

---

## Common Mistakes & Misconceptions

### Mistake 1: Forgetting `USE`

```sql
-- ❌ Error: No database selected
SELECT * FROM customers;
-- ERROR 1046 (3D000): No database selected
```

**Fix**: Always run `USE database_name;` first, or set the default database in your Workbench connection.

### Mistake 2: Misspelling Table or Column Names

```sql
-- ❌ Error: Table doesn't exist
SELECT * FROM cutomers;
-- ERROR 1146 (42S02): Table 'MyDatabase.cutomers' doesn't exist
```

**Fix**: Check the spelling. Use `SHOW TABLES;` to see exact table names.

### Mistake 3: Thinking SQL Executes Top to Bottom Like Python

SQL is declarative, not procedural. The order you write clauses is not the order they execute. Review Section 1.6.

### Mistake 4: Forgetting the Semicolon in Multi-Statement Scripts

```sql
-- ❌ This runs as one garbled statement and fails
SELECT * FROM customers
SELECT * FROM orders;
```

**Fix**: Add a semicolon after each statement: `SELECT * FROM customers;`

### Mistake 5: Using Double Quotes for Strings

```sql
-- ❌ Non-standard (works in MySQL but fails in PostgreSQL)
SELECT * FROM customers WHERE country = "Germany";

-- ✅ Standard SQL - works everywhere
SELECT * FROM customers WHERE country = 'Germany';
```

---

## Practice Exercises

### Beginner

**Exercise 1.1**: Connect to MySQL Workbench and list all databases on your server.

**Exercise 1.2**: Switch to `MyDatabase` and display all tables.

**Exercise 1.3**: Write a query to retrieve all columns from the `customers` table.

**Exercise 1.4**: Write a query to retrieve only the `first_name` and `score` columns from `customers`.

**Exercise 1.5**: Switch to `Parks_and_Recreation` and retrieve all data from the `employee_demographics` table.

**Exercise 1.6**: Write a query to retrieve the `first_name`, `last_name`, and `salary` from `employee_salary`.

### Intermediate

**Exercise 1.7**: Retrieve all data from `Parks_and_Recreation.parks_departments`. How many departments are there?

**Exercise 1.8**: In `MyDatabase`, retrieve only the `customer_id` and `sales` columns from the `orders` table. What is the highest sale amount?

**Exercise 1.9**: Write two separate queries in one script: one that retrieves all customers from `MyDatabase`, and one that retrieves all employee demographics from `Parks_and_Recreation`. Make sure both execute correctly.

> **Hint**: You will need a `USE` statement between them.

### Challenge

**Exercise 1.10**: Without running it, predict whether this query will work. Then test your prediction:

```sql
USE MyDatabase;
SELECT first_name, score * 10 AS big_score
FROM customers
ORDER BY big_score;
```

**Why does it work (or fail)?** Explain using the SQL execution order from Section 1.6.

**Exercise 1.11**: Examine the data in both `MyDatabase.customers` and `MyDatabase.orders`. Customer 6 placed an order (order_id 1004), but customer 6 does not exist in the `customers` table. What problem does this represent? How would you prevent it? (You will learn the answer formally in Chapter 3.)

---

## Key Takeaways

1. **A relational database stores data in tables linked by shared columns.** This eliminates data duplication and enforces data integrity.

2. **SQL is declarative.** You describe the result you want, not the steps to get it. The database engine optimises the execution plan for you.

3. **SQL execution order differs from writing order.** The engine processes: `FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT`. Understanding this prevents most "why doesn't my alias work?" confusion.

4. **MySQL and PostgreSQL share the same SQL foundation** but differ in syntax details. This course teaches MySQL first and highlights PostgreSQL differences where they matter.

5. **Every SQL statement ends with a semicolon.** Keywords are conventionally written in UPPERCASE. Strings use single quotes.

6. **Format your SQL for readability.** One clause per line, indented column lists. You will read your queries far more often than you write them.

---

## PostgreSQL Assignment

Complete these exercises using **pgAdmin 4** connected to your PostgreSQL server.

**PG-1.1**: Connect to the `mydatabase` you created during setup. List all tables.

**PG-1.2**: Run `SELECT * FROM customers;` in pgAdmin. Compare the output format to MySQL Workbench. Note any differences in how the results are displayed.

**PG-1.3**: Run `SELECT version();` to confirm your PostgreSQL version.

**PG-1.4**: In PostgreSQL, try running `SHOW DATABASES;` - the same command that works in MySQL. What happens? What is the PostgreSQL equivalent?

> **Hint**: PostgreSQL uses `\l` in the psql command line, or `SELECT datname FROM pg_database;` in a query.

---

## Chapter 1 Final Assignment: The 10-Table Data Maze

This assignment is designed to test your understanding of how the SQL execution order operates when retrieving data. You will be provided with a massive, pre-built dataset simulating a global e-commerce logistics company (`GlobalLogistics_DB.sql` in your datasets folder). 

This database contains **10 interconnected tables**, each loaded with at least **100 rows** of data (Customers, Warehouses, Shipments, Products, Couriers, Routes, Invoices, Suppliers, Inventory, Returns).

**Your Goal**: Write the exact SQL queries to answer the following business questions. 

> **Constraint**: You are strictly limited to the clauses taught in Chapter 1 (`SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`). You are not given any starting queries - you must build them from scratch. Pay careful attention to how your clauses are ordered and evaluated.

1. **The Warehouse Audit**: Retrieve the names, locations, and total capacity of all warehouses that are located in "Germany" and have a capacity greater than 50,000 units. Sort the results so the largest warehouse appears first.
2. **Courier Performance**: Find the top 5 couriers who have an average delivery time of less than 3 days. Display their `courier_name` and `avg_delivery_time`.
3. **The Lost Shipments**: Retrieve all columns for shipments that have a `status` of 'Lost' or 'Delayed', but only if the `shipping_cost` is over $500. Sort them by cost, from highest to lowest.
4. **Execution Order Puzzle**: Why does this query fail? Fix it so it runs correctly using only `SELECT`, `FROM`, `WHERE`, and `ORDER BY`.
   ```sql
   -- This query throws an error! Fix it without using a subquery.
   SELECT product_name, (price - cost) AS profit
   FROM Products
   WHERE profit > 100
   ORDER BY profit DESC;
   ```
5. **Inventory Crisis**: We need to find the 10 most critically low products. Retrieve the `product_name`, `stock_level`, and `supplier_id` where the stock level is below 20. Order the results so the product with the *lowest* stock appears first.

---

## Next Chapter

→ **Chapter 2 - Querying Data (SELECT)**: Now that you can connect and run basic queries, we go deep on the `SELECT` statement - aliases, expressions, sorting, limiting, and building queries that extract exactly the information you need.
