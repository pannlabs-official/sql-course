# SQL Course - Complete Course Overview

---

## Welcome

This is a comprehensive, hands-on SQL course designed for data analysis trainees. It takes you from zero database knowledge to writing complex analytical queries, optimising performance, and using AI to accelerate your SQL workflow.

The course is structured around **MySQL** as the primary database engine. **PostgreSQL** is introduced as a secondary engine through assignments, ensuring you can work confidently across the two most widely used open-source databases in the industry.

By the end of this course, you will not just "know SQL." You will be able to sit in front of any relational database, understand its structure, query it efficiently, design schemas, troubleshoot slow queries, and deliver analytical insights from raw data.

---

## Who This Course Is For

- Data analysis trainees learning SQL as part of their professional curriculum
- Career changers moving into data analytics, business intelligence, or data engineering
- Anyone who wants to go beyond surface-level SQL tutorials and develop genuine proficiency

### Prerequisites

- **Technical**: None. We start from scratch - what a database is, how to install MySQL, how to run your first query.
- **Mindset**: Willingness to type queries yourself, make mistakes, and debug them. Reading SQL is not the same as writing SQL.

---

## Course Structure

The course is divided into **12 chapters**, each building on the previous. The progression follows the natural learning path: understand what databases are → read data → define structures → modify data → filter and combine → transform → aggregate and analyse → go deeper → optimise → integrate with modern tools → apply everything.

### Chapter Map

| Chapter | Title | What You'll Learn |
|---|---|---|
| **1** | Introduction | What databases and SQL are, setting up MySQL and PostgreSQL, running your first queries |
| **2** | Querying Data (SELECT) | Retrieving data, column aliases, sorting, limiting results, expressions |
| **3** | Data Definition (DDL) | Creating databases and tables, data types, constraints, foreign keys |
| **4** | Data Manipulation (DML) | Inserting, updating, and deleting data, transactions |
| **5** | Filtering Data | WHERE clause, comparison and logical operators, pattern matching, NULLs |
| **6** | Combining Data | INNER/LEFT/RIGHT/FULL/CROSS/SELF joins, UNION, INTERSECT, EXCEPT |
| **7** | Row-Level Functions | String, numeric, date/time, NULL-handling, and CASE functions |
| **8** | Aggregation & Analytical Functions | COUNT, SUM, AVG, GROUP BY, HAVING, window functions (ranking, running totals, LAG/LEAD) |
| **9** | Advanced SQL Techniques | Subqueries, CTEs, recursive CTEs, views, stored procedures, triggers |
| **10** | Performance Optimisation | Indexes, EXPLAIN, query optimisation, partitioning |
| **11** | AI & SQL | Using AI to write/debug/optimise SQL, Python integration, modern data stack |
| **12** | SQL Projects | 6 guided capstone projects applying everything from the course |

### Chapter Dependencies

```
Ch.1 (Introduction)
 └── Ch.2 (SELECT)
      ├── Ch.3 (DDL)
      ├── Ch.4 (DML)
      └── Ch.5 (Filtering)
           └── Ch.6 (Combining Data)
                ├── Ch.7 (Row-Level Functions)
                │    └── Ch.8 (Aggregation & Analytical)
                │         └── Ch.9 (Advanced Techniques)
                │              └── Ch.10 (Performance)
                │                   └── Ch.11 (AI & SQL)
                └──────────────────── Ch.12 (Projects - uses everything)
```

---

## Databases Used

This course uses **6 databases** of varying complexity. You will install all of them during setup (see `00-database-setup-guide.md`). Each database serves a specific purpose.

### Primary Databases

| Database | Description | Used In |
|---|---|---|
| **`MyDatabase`** | Minimal 2-table schema (customers, orders). Your first-ever SQL playground. | Ch. 1, 2 |
| **`salesdb`** | Core teaching database with 5 tables: customers, employees, products, orders, orders_archive. Has foreign keys, self-referencing manager hierarchy, and archive data. | Ch. 2–12 |
| **`Parks_and_Recreation`** | Fun, TV-show-themed database with employee demographics, salaries, and departments. Beginner-friendly and memorable. | Ch. 1, 4 |

### Supplementary Databases

| Database | Description | Used In |
|---|---|---|
| **`sql_store`** (or `store`) | E-commerce database with 7 tables: products, shippers, customers, order_statuses, orders, order_items, order_item_notes. Richer schema with composite primary keys and lookup tables. | Ch. 5, 6, 7, 9 |
| **`sql_hr`** | HR database with 2 tables: offices (10 records) and employees (20 records with self-referencing `reports_to`). | Ch. 6, 9 |
| **`sql_invoicing`** (or `invoicing`) | Financial database with 4 tables: payment_methods, clients, invoices, payments. Uses decimal types for monetary values. | Ch. 6, 7, 8 |

### Large-Scale Database

| Database | Description | Used In |
|---|---|---|
| **`employees`** | Classic MySQL test database - 93MB, ~300,000 employee records with salaries, titles, departments. Used exclusively for performance optimization where real data volume is needed to see meaningful differences. | Ch. 10 |

---

## Tools Required

### Must-Have (Install Before Chapter 1)

| Tool | Purpose | Download |
|---|---|---|
| **MySQL Server 8.0+** | Primary database engine | [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/) |
| **MySQL Workbench** | GUI for writing and running MySQL queries | [mysql.com/downloads/workbench](https://dev.mysql.com/downloads/workbench/) |
| **PostgreSQL 15+** | Secondary database engine (for assignments) | [postgresql.org/download](https://www.postgresql.org/download/) |
| **pgAdmin 4** | GUI for writing and running PostgreSQL queries | Included with PostgreSQL installer |

### Optional (Used in Later Chapters)

| Tool | Purpose | When Needed |
|---|---|---|
| **Python 3.10+** | SQL-Python integration | Ch. 11 |
| **VS Code** or any text editor | Writing SQL scripts outside the GUI | Any chapter |
| **ChatGPT / Claude / Copilot** | AI-assisted SQL workflows | Ch. 11 |

---

## How to Use This Course

### If You Are a Trainee

1. **Follow the setup guide first** (`00-database-setup-guide.md`). Do not skip this - every example depends on having the databases loaded.
2. **Read each chapter in order**. Type every SQL example yourself. Do not copy-paste. The act of typing builds muscle memory for syntax.
3. **Do the exercises at the end of each chapter** before moving on. They are graded by difficulty (Beginner → Intermediate → Challenge). Start with Beginner even if you feel confident.
4. **Use the PostgreSQL assignments** to practice translating between engines. This is a real-world skill - most data professionals work with multiple engines.
5. **When you get an error**, read the error message carefully. MySQL error messages are usually clear and tell you exactly what went wrong. This course intentionally shows common errors so you learn to recognise them.

### If You Are the Trainer

- Each chapter is self-contained and can be delivered as a standalone session
- Worked examples are designed for live coding - run them in front of trainees and discuss the output
- "Common Mistakes" sections are excellent for interactive discussions: show the broken query first, ask trainees what's wrong
- The practice exercises can be used as in-class work or homework
- The 6 capstone projects in Chapter 12 work well as assessed coursework

---

## Conventions Used in This Course

### SQL Code Blocks

All SQL examples are formatted as code blocks with comments explaining the logic:

```sql
-- Retrieve all customers from Germany, sorted by score (highest first)
SELECT
    first_name,
    country,
    score
FROM customers
WHERE country = 'Germany'
ORDER BY score DESC;
```

### Expected Output

After worked examples, the expected result is shown as a table:

| first_name | country | score |
|---|---|---|
| Mark | Germany | 500 |
| Jossef | Germany | 350 |

### Engine-Specific Notes

Where MySQL and PostgreSQL syntax differs, it is called out explicitly:

> **MySQL**: `LIMIT 5`  
> **PostgreSQL**: `LIMIT 5` (same) or `FETCH FIRST 5 ROWS ONLY` (SQL standard)

### Warning Boxes

Dangerous operations or critical misconceptions are highlighted:

> ⚠️ **WARNING**: `DROP DATABASE` permanently deletes the entire database and all its data. There is no undo. Always double-check the database name before executing.

### Common Mistake Boxes

> ❌ **Common Mistake**: Using `WHERE score = NULL` instead of `WHERE score IS NULL`. The `=` operator cannot compare to NULL - it always returns UNKNOWN, so no rows are ever returned.

---

## File Structure

```
My course/
├── assets/                              ← Reference materials (databases, scripts, PDFs)
├── 00-course-overview.md                ← You are here
├── 00-database-setup-guide.md           ← Environment setup (do this first)
├── 01-introduction.md                   ← Chapter 1
├── 02-querying-data-select.md           ← Chapter 2
├── 03-data-definition-ddl.md            ← Chapter 3
├── 04-data-manipulation-dml.md          ← Chapter 4
├── 05-filtering-data.md                 ← Chapter 5
├── 06-combining-data.md                 ← Chapter 6
├── 07-row-level-functions.md            ← Chapter 7
├── 08-aggregation-analytical-functions.md ← Chapter 8
├── 09-advanced-sql-techniques.md        ← Chapter 9
├── 10-performance-optimization.md       ← Chapter 10
├── 11-ai-and-sql.md                     ← Chapter 11
└── 12-sql-projects.md                   ← Chapter 12
```

---

## What Makes This Course Different

1. **Depth over breadth**: Each topic is explained with enough detail that you understand *why* the SQL works, not just *what* to type. When you encounter a variation you haven't seen before, you'll be able to reason about it.

2. **Real databases, not toy examples**: You work with 6 databases of varying complexity - from a 5-row customer table to a 300,000-row employee database. This mirrors real work where you move between different schemas daily.

3. **MySQL + PostgreSQL**: Most courses teach one engine. We teach MySQL as the primary and give you PostgreSQL assignments so you can adapt - a skill employers value highly.

4. **Error-first teaching**: We show you the wrong way before the right way. Seeing `ERROR 1054 (42S22): Unknown column` and understanding why it happened teaches you more than a hundred correct examples.

5. **Exercises with teeth**: The exercises are not afterthoughts. They are carefully designed to test specific concepts, and the Challenge-level problems are genuinely challenging - they combine multiple concepts and require you to think about the problem before writing SQL.

---

## Next Step

→ Go to **`00-database-setup-guide.md`** and set up your environment.
