# SQL Course - Full Course Content Build

## Context

You (the trainer) are building a comprehensive SQL course for **data analysis trainees** learning SQL as part of their curriculum. The primary database engine is **MySQL**, with **PostgreSQL** assigned for exercises/assignments. The course follows **your existing 12-chapter mind map** structure and aims to produce well-rounded SQL proficiency.

The goal is to produce **12 detailed chapter files** - not summaries, but actual lesson content a trainer can deliver and a trainee can study from.

---

## What Each Chapter Will Contain

Every chapter will be a standalone markdown file with:

| Section | Description |
|---|---|
| **Chapter Overview** | What this chapter covers, why it matters, prerequisites |
| **Learning Objectives** | Concrete, measurable outcomes (not vague "understand X") |
| **Topics & Subtopics** | Hierarchical breakdown with detailed lesson notes |
| **Worked Examples** | Real SQL queries against a consistent sample database, with expected output |
| **MySQL vs PostgreSQL Notes** | Engine-specific syntax differences where relevant |
| **Common Mistakes & Misconceptions** | Things trainees actually get wrong |
| **Practice Exercises** | Graded difficulty (Beginner → Intermediate → Challenge) |
| **Chapter Summary** | Key takeaways, not just a rehash |

---

## Sample Database

All examples will reference a consistent **company database** (`company_db`) with these tables:
- `employees` - employee records, departments, salaries, hire dates
- `departments` - department metadata
- `projects` - project records with budgets and timelines
- `project_assignments` - many-to-many between employees and projects
- `sales` - transactional sales data with dates, amounts, regions
- `customers` - customer demographics and regions
- `products` - product catalog with categories and pricing
- `orders` / `order_items` - order header and line items

This gives enough relational complexity for JOINs, subqueries, aggregations, and real analytical scenarios.

---

## Proposed Chapter Outline (Detailed)

### Chapter 1 - Introduction
- What is a database? (Relational vs Non-Relational - why relational matters for data analysis)
- What is SQL? History, ANSI standards, declarative vs procedural
- Database engines: MySQL, PostgreSQL, SQL Server, SQLite - when to use what
- Setting up MySQL (Workbench) and PostgreSQL (pgAdmin)
- The `company_db` schema walkthrough - ERD and table relationships
- Your first queries: `SELECT`, `FROM`, basic output
- SQL execution order vs writing order (the mental model that prevents 90% of confusion)

### Chapter 2 - Querying Data (SELECT)
- `SELECT` fundamentals: columns, expressions, literals
- `SELECT *` - why it exists and why you should almost never use it in production
- Column aliases (`AS`) - naming conventions, when quotes are required
- `DISTINCT` - what it actually does (full-row deduplication, not column-level)
- `ORDER BY` - multi-column sorting, `ASC`/`DESC`, sorting by expression, `NULLS FIRST/LAST` (PostgreSQL)
- `LIMIT` / `OFFSET` (MySQL) vs `FETCH FIRST` (SQL standard) - pagination patterns
- Inline expressions and arithmetic in SELECT
- `CASE WHEN` as a column-level transformer
- **Exercises**: 10 queries of escalating complexity

### Chapter 3 - Data Definition (DDL)
- `CREATE DATABASE`, `USE`, `DROP DATABASE`
- `CREATE TABLE` - column definitions, data types deep dive (INT variants, VARCHAR vs CHAR vs TEXT, DATE vs DATETIME vs TIMESTAMP, DECIMAL vs FLOAT)
- MySQL vs PostgreSQL data type mapping
- Constraints: `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`
- Foreign keys: `REFERENCES`, `ON DELETE CASCADE` vs `SET NULL` vs `RESTRICT`
- `ALTER TABLE` - adding/dropping/modifying columns and constraints
- `DROP TABLE`, `TRUNCATE TABLE` - differences and dangers
- `CREATE TABLE ... AS SELECT` - creating tables from queries
- Naming conventions and schema design principles
- **Exercises**: Build the `company_db` from scratch

### Chapter 4 - Data Manipulation (DML)
- `INSERT INTO` - single row, multi-row, `INSERT INTO ... SELECT`
- `UPDATE` - single column, multi-column, conditional updates, UPDATE with JOINs
- `DELETE` - targeted deletion, `DELETE` vs `TRUNCATE`
- `REPLACE` (MySQL-specific) and `INSERT ... ON DUPLICATE KEY UPDATE`
- PostgreSQL's `INSERT ... ON CONFLICT` (UPSERT)
- Transaction basics: `START TRANSACTION`, `COMMIT`, `ROLLBACK` - why DML without transactions is reckless
- Auto-commit behavior in MySQL vs PostgreSQL
- **Exercises**: Populate `company_db` with realistic data, then modify it

### Chapter 5 - Filtering Data
- `WHERE` clause - the gatekeeper
- Comparison operators: `=`, `!=`/`<>`, `<`, `>`, `<=`, `>=`
- Logical operators: `AND`, `OR`, `NOT` - precedence rules (why parentheses matter)
- `BETWEEN` - inclusive on both ends, gotchas with dates
- `IN` / `NOT IN` - list matching, subquery usage, NULL trap
- `LIKE` / `NOT LIKE` - wildcards `%` and `_`, case sensitivity (MySQL vs PostgreSQL)
- `IS NULL` / `IS NOT NULL` - why `= NULL` doesn't work
- `REGEXP` (MySQL) / `~` (PostgreSQL) - pattern matching beyond LIKE
- `EXISTS` vs `IN` - when each is appropriate and why
- Combining filters: building complex WHERE clauses without losing readability
- **Exercises**: 12 filtering challenges on the sales and customer data

### Chapter 6 - Combining Data
- Why combining data matters: normalization means data lives in multiple tables
- `INNER JOIN` - the most common join, how it works mechanically
- `LEFT JOIN` / `RIGHT JOIN` - preserving rows, NULL-fill behavior
- `FULL OUTER JOIN` - MySQL workaround (UNION of LEFT and RIGHT)
- `CROSS JOIN` - Cartesian products, actual use cases
- `SELF JOIN` - hierarchical data (employee → manager), finding duplicates
- Join conditions: `ON` vs `USING` - when each is clearer
- Multi-table joins: chaining 3, 4, 5 tables - reading execution plans
- `UNION` / `UNION ALL` / `INTERSECT` / `EXCEPT` - set operations
- Common join mistakes: accidental Cartesian products, ambiguous columns, join order
- **Exercises**: 15 join-heavy analytical queries

### Chapter 7 - Row-Level Functions
- What "row-level" means: input one row, output one row
- String functions: `CONCAT`, `SUBSTRING`, `LENGTH`, `UPPER`/`LOWER`, `TRIM`, `REPLACE`, `LEFT`/`RIGHT`, `REVERSE`, `LPAD`/`RPAD`
- Numeric functions: `ROUND`, `CEIL`/`FLOOR`, `ABS`, `MOD`, `POWER`, `TRUNCATE`
- Date/Time functions: `NOW()`, `CURDATE()`, `DATE_FORMAT` (MySQL) vs `TO_CHAR` (PG), `DATEDIFF` vs `AGE()`, date arithmetic, extracting parts (`YEAR`, `MONTH`, `DAY`, `EXTRACT`)
- Conversion functions: `CAST`, `CONVERT`, implicit vs explicit type casting
- NULL-handling functions: `IFNULL`/`COALESCE`, `NULLIF` - defensive querying
- Conditional logic: `IF()` (MySQL), `CASE WHEN` (universal) - nested and searched CASE
- MySQL vs PostgreSQL function differences (comprehensive comparison table)
- **Exercises**: Data cleaning and transformation scenarios

### Chapter 8 - Aggregation & Analytical Functions
- Aggregate functions: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` - behavior with NULLs
- `COUNT(*)` vs `COUNT(column)` vs `COUNT(DISTINCT column)` - what each actually counts
- `GROUP BY` - how it partitions data, column requirements, expression grouping
- `HAVING` vs `WHERE` - post-aggregation filtering, common confusion
- `GROUP BY` with `ROLLUP` and `CUBE` - subtotals and grand totals
- `GROUPING()` function - distinguishing real NULLs from rollup NULLs
- Window functions (the game changer):
  - `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()` - ranking patterns
  - `OVER(PARTITION BY ... ORDER BY ...)` - anatomy of a window
  - `LAG()`, `LEAD()` - comparing rows to previous/next
  - `SUM() OVER()`, `AVG() OVER()` - running totals and moving averages
  - `FIRST_VALUE()`, `LAST_VALUE()`, `NTH_VALUE()` - positional access
  - `NTILE()` - percentile bucketing
  - Frame specifications: `ROWS BETWEEN`, `RANGE BETWEEN` - precise window control
- **Exercises**: Sales analytics, employee ranking, time-series analysis

### Chapter 9 - Advanced SQL Techniques
- Subqueries: scalar, column, row, table - where each can appear
- Correlated subqueries - row-by-row execution, performance implications
- Common Table Expressions (CTEs): `WITH` - readability, reusability, recursive CTEs
- Recursive CTEs: hierarchical queries (org charts, bill of materials)
- `VIEWS` - virtual tables, updatable views, `CREATE OR REPLACE VIEW`
- Stored procedures and functions (MySQL focus) - parameters, control flow, `DELIMITER`
- Triggers - `BEFORE`/`AFTER` on `INSERT`/`UPDATE`/`DELETE`, audit logging use case
- Temporary tables vs CTEs vs subqueries - when to use which
- Pivoting data: transforming rows to columns (MySQL approach vs PostgreSQL `crosstab`)
- Dynamic SQL: `PREPARE` and `EXECUTE` - when static SQL isn't enough
- **Exercises**: Complex multi-layered analytical queries

### Chapter 10 - Performance Optimization
- How queries execute: the query optimizer, execution plans
- `EXPLAIN` / `EXPLAIN ANALYZE` - reading and interpreting output
- Indexes: what they are (B-tree, Hash), how they work, when they help/hurt
- `CREATE INDEX`, composite indexes, covering indexes, index selectivity
- Query optimization patterns: avoiding `SELECT *`, reducing subqueries, SARGable predicates
- Join optimization: join order, nested loops vs hash joins, index usage
- `ANALYZE TABLE` and table statistics
- Partitioning: range, list, hash - when it's worth the complexity
- Query profiling: `SHOW PROFILE` (MySQL), `pg_stat_statements` (PostgreSQL)
- Common anti-patterns: implicit conversions, functions on indexed columns, `OR` vs `UNION`
- **Exercises**: Diagnose and fix slow queries

### Chapter 11 - AI & SQL
- The modern data stack: where SQL meets data science
- SQL for feature engineering: preparing data for ML models
- Using SQL with Python: `mysql-connector-python`, `psycopg2`, SQLAlchemy
- Pandas `read_sql()` - bridging SQL results into DataFrames
- AI-generated SQL: using LLMs (ChatGPT, Copilot) to write queries - what to trust, what to verify
- Natural language to SQL: emerging tools and their limitations
- Automated EDA with SQL: statistical profiling queries
- SQL in cloud data platforms: BigQuery, Redshift, Snowflake - how syntax diverges
- Ethics: data privacy, bias in analytical queries, responsible data handling
- **Exercises**: End-to-end data pipeline mini-projects

### Chapter 12 - SQL Projects
- **Project 1**: Sales Performance Dashboard - multi-table analytics, KPIs, window functions
- **Project 2**: Customer Segmentation Analysis - RFM analysis, cohort queries
- **Project 3**: Employee Attrition Analysis - HR analytics, date calculations, statistical queries
- **Project 4**: Inventory Management System - schema design, triggers, stored procedures
- **Project 5**: Data Quality Audit - finding duplicates, orphan records, inconsistencies
- Each project includes: business context, requirements, schema, guided solution, extension challenges

---

## File Structure

```
C:\Users\petre\OneDrive\Desktop\Desktop\Courses\SQL\My course\
├── assets/                          (your existing reference materials)
├── 00-course-overview.md            (course intro, how to use, sample DB setup)
├── 00-sample-database-setup.sql     (CREATE + INSERT scripts for company_db)
├── 01-introduction.md
├── 02-querying-data-select.md
├── 03-data-definition-ddl.md
├── 04-data-manipulation-dml.md
├── 05-filtering-data.md
├── 06-combining-data.md
├── 07-row-level-functions.md
├── 08-aggregation-analytical-functions.md
├── 09-advanced-sql-techniques.md
├── 10-performance-optimization.md
├── 11-ai-and-sql.md
└── 12-sql-projects.md
```

---

## User Review Required

> [!IMPORTANT]
> **Chapter scope**: Your mind map has 12 chapters. The outline above follows your structure exactly. If you want to add, remove, merge, or reorder any chapters, now is the time.

> [!IMPORTANT]
> **Sample database**: I'm proposing a `company_db` with employees, departments, projects, sales, customers, products, and orders. This covers analytical, transactional, and relational scenarios. Do you have a specific dataset or schema you'd prefer instead?

> [!IMPORTANT]
> **Depth vs Chapter 11 (AI & SQL)**: This is the most "modern" chapter and could go very deep (Python integration, cloud platforms) or stay practical (just SQL-side techniques for data prep). Which direction do you prefer?

## Open Questions

1. **Do you want PostgreSQL-specific assignment files** as separate `.md` files alongside each chapter, or inline within each chapter?
2. **Do you have an existing SQL setup script** or datasets you want me to incorporate, or should I create the full `company_db` from scratch?
3. **Trainer notes**: Do you want a separate "Trainer Guide" section in each chapter with delivery tips, estimated timing, and common student questions? Or keep it student-facing only?

---

## Execution Plan

This is a large content project. I'll write each chapter sequentially, delivering complete files one at a time. Each chapter will be **800–1500+ lines** of detailed content. Estimated delivery:

1. Sample database setup SQL file first
2. Course overview document
3. Chapters 1 through 12, in order

## Verification Plan

### Content Verification
- All SQL examples will be syntactically valid MySQL 8.0+
- PostgreSQL differences will be noted wherever syntax diverges
- Exercises will be self-consistent with the sample database schema
- No placeholder or filler content - every section will have substantive teaching material
