# Chapter 4 — Data Manipulation (DML)

---

## Chapter Overview

In Chapter 3, you built the containers (databases and tables). Now it is time to fill them — and learn how to modify and remove data safely. Data Manipulation Language (DML) covers the three operations that change what is *inside* a table: `INSERT` (add rows), `UPDATE` (modify rows), and `DELETE` (remove rows).

This chapter also introduces **transactions** — the mechanism that lets you group multiple changes into a single atomic operation that either fully succeeds or fully rolls back. Transactions are what separate a professional data workflow from a dangerous one.

### Prerequisites

- Completed Chapters 1–3
- `salesdb` and `Parks_and_Recreation` loaded in MySQL

### Databases Used

- `salesdb` — for INSERT, UPDATE, DELETE exercises on real relational data
- `Parks_and_Recreation` — for beginner-friendly DML practice
- `my_practice_db` — the database you created in Chapter 3 (or create a fresh one)

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Insert single and multiple rows into a table
2. Insert data from one table into another using `INSERT INTO ... SELECT`
3. Update existing rows — single columns, multiple columns, and conditional updates
4. Delete specific rows and understand the difference between `DELETE` and `TRUNCATE`
5. Use `REPLACE` and `INSERT ... ON DUPLICATE KEY UPDATE` for upsert operations
6. Wrap DML operations in transactions with `START TRANSACTION`, `COMMIT`, and `ROLLBACK`
7. Explain auto-commit behaviour and why explicit transactions matter
8. Load data from CSV files into MySQL tables

---

## 4.1 INSERT — Adding Data

### 4.1.1 Inserting a Single Row

The basic INSERT syntax specifies the table, the columns, and the values:

```sql
USE my_practice_db;

-- Make sure the students table exists (from Chapter 3)
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100),
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    gpa DECIMAL(3, 2) DEFAULT 0.00
);

-- Insert a single row
INSERT INTO students (first_name, last_name, email, gpa)
VALUES ('Alice', 'Smith', 'alice@example.com', 3.85);
```

Verify:

```sql
SELECT * FROM students;
```

| student_id | first_name | last_name | email | enrollment_date | gpa |
|---|---|---|---|---|---|
| 1 | Alice | Smith | alice@example.com | 2026-06-11 | 3.85 |

Notice:
- `student_id` was auto-generated (AUTO_INCREMENT)
- `enrollment_date` used the DEFAULT value (today's date)
- We specified the columns we wanted to fill — columns we omitted got their defaults

### 4.1.2 Inserting Without Specifying Columns

You can omit the column list if you provide values for **every** column in the correct order:

```sql
-- Values must match the exact table column order
INSERT INTO students 
VALUES (NULL, 'Bob', 'Jones', 'bob@example.com', '2026-01-15', 3.50);
```

- `NULL` for `student_id` tells MySQL to use AUTO_INCREMENT
- The values must be in the same order as the columns were defined in CREATE TABLE

> ⚠️ **Not recommended.** If someone adds or reorders columns later, this query silently breaks or inserts data into the wrong columns. Always list your columns explicitly.

### 4.1.3 Inserting Multiple Rows

```sql
-- Insert 3 rows in a single statement (much faster than 3 separate INSERTs)
INSERT INTO students (first_name, last_name, email, gpa) VALUES
    ('Carol', 'Williams', 'carol@example.com', 3.92),
    ('David', 'Brown', 'david@example.com', 2.78),
    ('Eve', 'Davis', 'eve@example.com', 3.45);
```

Verify:

```sql
SELECT * FROM students;
```

| student_id | first_name | last_name | email | enrollment_date | gpa |
|---|---|---|---|---|---|
| 1 | Alice | Smith | alice@example.com | 2026-06-11 | 3.85 |
| 2 | Bob | Jones | bob@example.com | 2026-01-15 | 3.50 |
| 3 | Carol | Williams | carol@example.com | 2026-06-11 | 3.92 |
| 4 | David | Brown | david@example.com | 2026-06-11 | 2.78 |
| 5 | Eve | Davis | eve@example.com | 2026-06-11 | 3.45 |

> **Performance note**: Multi-row INSERT is significantly faster than individual INSERT statements. For bulk loading, always batch your inserts.

### 4.1.4 INSERT INTO ... SELECT

Copy data from one table (or query result) into another:

```sql
-- Create a backup table
CREATE TABLE students_backup AS SELECT * FROM students WHERE 1=0;
-- The WHERE 1=0 trick creates the table structure with zero rows

-- Copy all students with GPA above 3.5 into the backup
INSERT INTO students_backup
SELECT * FROM students
WHERE gpa > 3.50;

SELECT * FROM students_backup;
```

| student_id | first_name | last_name | email | enrollment_date | gpa |
|---|---|---|---|---|---|
| 1 | Alice | Smith | alice@example.com | 2026-06-11 | 3.85 |
| 3 | Carol | Williams | carol@example.com | 2026-06-11 | 3.92 |

This is extremely useful for:
- Creating backups before risky operations
- Populating staging tables
- Migrating data between schemas
- Archiving old records

### 4.1.5 Inserting with Specific Columns from SELECT

You do not need to select all columns — just match the target table's expected columns:

```sql
-- Create a simple name list table
CREATE TABLE student_names (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100)
);

-- Populate it from the students table
INSERT INTO student_names (full_name)
SELECT CONCAT(first_name, ' ', last_name)
FROM students;

SELECT * FROM student_names;
```

| id | full_name |
|---|---|
| 1 | Alice Smith |
| 2 | Bob Jones |
| 3 | Carol Williams |
| 4 | David Brown |
| 5 | Eve Davis |

---

## 4.2 UPDATE — Modifying Data

### 4.2.1 Updating a Single Column

```sql
-- Give Alice a new GPA
UPDATE students
SET gpa = 3.95
WHERE student_id = 1;
```

> ⚠️ **The WHERE clause is critical.** Without it, `UPDATE` modifies **every row** in the table. This is the single most dangerous SQL mistake.

```sql
-- ❌ DANGEROUS: This sets EVERY student's GPA to 3.95
UPDATE students
SET gpa = 3.95;
-- All 5 students now have gpa = 3.95
```

### 4.2.2 Updating Multiple Columns

```sql
-- Update Bob's email and GPA in a single statement
UPDATE students
SET email = 'bob.jones@newmail.com',
    gpa = 3.65
WHERE student_id = 2;
```

### 4.2.3 Conditional Updates with Expressions

```sql
-- Give everyone a 5% GPA boost (capped at 4.00)
UPDATE students
SET gpa = LEAST(gpa * 1.05, 4.00);

-- Increase salary by 10% for all Sales employees in salesdb
USE salesdb;
UPDATE employees
SET salary = salary * 1.10
WHERE department = 'Sales';
```

After the salary update:

```sql
SELECT firstname, lastname, department, salary FROM employees;
```

| firstname | lastname | department | salary |
|---|---|---|---|
| Frank | Lee | Marketing | 55000 |
| Kevin | Brown | Marketing | 65000 |
| Mary | NULL | Sales | 82500 |
| Michael | Ray | Sales | 99000 |
| Carol | Baker | Sales | 60500 |

> **Note**: These changes are permanent once committed. In the exercises, we will use transactions to safely undo modifications.

### 4.2.4 UPDATE with Subquery

```sql
-- Set a customer's score to the average score of all customers
USE salesdb;

UPDATE customers
SET score = (SELECT AVG(score) FROM customers)
WHERE customerid = 5;
```

> **MySQL restriction**: You cannot UPDATE a table and SELECT from the same table in a subquery directly in some MySQL versions. The workaround is to use a derived table or a JOIN.

### 4.2.5 UPDATE with JOIN (MySQL Syntax)

MySQL allows you to update a table based on a JOIN with another table:

```sql
-- Update the order status to 'Delivered' for all orders 
-- placed by customers from Germany
UPDATE orders o
JOIN customers c ON o.customerid = c.customerid
SET o.orderstatus = 'Delivered'
WHERE c.country = 'Germany';
```

This is a MySQL extension — PostgreSQL uses a different syntax:

```sql
-- PostgreSQL equivalent
UPDATE orders
SET orderstatus = 'Delivered'
FROM customers
WHERE orders.customerid = customers.customerid
  AND customers.country = 'Germany';
```

---

## 4.3 DELETE — Removing Data

### 4.3.1 Deleting Specific Rows

```sql
USE my_practice_db;

-- Delete a specific student
DELETE FROM students
WHERE student_id = 4;
```

> ⚠️ **Same warning as UPDATE: never omit the WHERE clause unless you intend to delete everything.**

```sql
-- ❌ DANGEROUS: Deletes ALL students
DELETE FROM students;
```

### 4.3.2 Deleting Multiple Rows with a Condition

```sql
-- Delete all students with GPA below 3.00
DELETE FROM students
WHERE gpa < 3.00;
```

### 4.3.3 DELETE vs TRUNCATE vs DROP

| Operation | What It Does | WHERE clause? | Can Rollback? | Resets AUTO_INCREMENT? | Speed |
|---|---|---|---|---|---|
| `DELETE FROM table` | Removes all rows, one by one | No (deletes all) | ✅ Yes (if in a transaction) | ❌ No | Slow for large tables |
| `DELETE FROM table WHERE ...` | Removes matching rows | Yes | ✅ Yes (if in a transaction) | ❌ No | Depends on match count |
| `TRUNCATE TABLE table` | Removes all rows instantly | ❌ No | ❌ No (DDL operation) | ✅ Yes, resets to 1 | Very fast |
| `DROP TABLE table` | Removes the table entirely | ❌ No | ❌ No | N/A (table is gone) | Instant |

**When to use each**:
- `DELETE` — when you need to remove specific rows, or need the ability to roll back
- `TRUNCATE` — when you want to empty a table quickly and do not need to undo it
- `DROP` — when you want to remove the table definition itself

### 4.3.4 DELETE with JOIN (MySQL)

```sql
-- Delete orders for products in the 'Clothing' category
USE salesdb;

DELETE o
FROM orders o
JOIN products p ON o.productid = p.productid
WHERE p.category = 'Clothing';
```

> ⚠️ **Be extremely careful with DELETE + JOIN.** Always run the equivalent SELECT first to see which rows will be affected:

```sql
-- PREVIEW: See what will be deleted before actually deleting
SELECT o.*
FROM orders o
JOIN products p ON o.productid = p.productid
WHERE p.category = 'Clothing';
```

---

## 4.4 REPLACE and UPSERT

### 4.4.1 REPLACE (MySQL-Specific)

`REPLACE` works like INSERT, but if a row with the same primary key (or unique key) already exists, it **deletes the old row and inserts the new one**:

```sql
USE my_practice_db;

-- If student_id 1 exists, delete it and insert this new row
-- If student_id 1 doesn't exist, just insert
REPLACE INTO students (student_id, first_name, last_name, email, gpa)
VALUES (1, 'Alice', 'Smith-Updated', 'alice.new@example.com', 3.99);
```

> ⚠️ **REPLACE deletes then inserts.** This means:
> - Auto-increment counters may advance unexpectedly
> - ON DELETE triggers fire
> - Columns not specified in the REPLACE get their default values (not the old values)
> 
> For most use cases, `INSERT ... ON DUPLICATE KEY UPDATE` is safer.

### 4.4.2 INSERT ... ON DUPLICATE KEY UPDATE (MySQL UPSERT)

This is the preferred MySQL approach for "insert if new, update if exists":

```sql
INSERT INTO students (student_id, first_name, last_name, email, gpa)
VALUES (1, 'Alice', 'Smith', 'alice@example.com', 3.95)
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    gpa = VALUES(gpa);
```

If `student_id = 1` exists: updates `email` and `gpa` to the new values.  
If `student_id = 1` does not exist: inserts the new row.

> **MySQL 8.0.19+ syntax** (preferred):
> ```sql
> INSERT INTO students (student_id, first_name, last_name, email, gpa)
> VALUES (1, 'Alice', 'Smith', 'alice@example.com', 3.95) AS new_row
> ON DUPLICATE KEY UPDATE
>     email = new_row.email,
>     gpa = new_row.gpa;
> ```

### 4.4.3 PostgreSQL UPSERT: INSERT ... ON CONFLICT

PostgreSQL uses a different syntax that is more explicit about which conflict triggers the upsert:

```sql
-- PostgreSQL syntax
INSERT INTO students (student_id, first_name, last_name, email, gpa)
VALUES (1, 'Alice', 'Smith', 'alice@example.com', 3.95)
ON CONFLICT (student_id) DO UPDATE SET
    email = EXCLUDED.email,
    gpa = EXCLUDED.gpa;
```

| Feature | MySQL | PostgreSQL |
|---|---|---|
| Upsert syntax | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE SET` |
| Conflict target | Implicit (any unique/PK violation) | Explicit (you specify which constraint) |
| Reference new values | `VALUES(column)` or alias | `EXCLUDED.column` |
| Do nothing on conflict | Not directly supported | `ON CONFLICT ... DO NOTHING` |

---

## 4.5 Transactions

### 4.5.1 What Is a Transaction?

A transaction is a group of SQL operations that are treated as a **single unit of work**. Either **all** operations succeed (commit), or **none** of them do (rollback).

**The classic example**: Transferring money between bank accounts.

```
1. Deduct $500 from Account A
2. Add $500 to Account B
```

If step 1 succeeds but step 2 fails (database crash, network error), Account A lost $500 that never arrived in Account B. A transaction prevents this — if step 2 fails, step 1 is automatically undone.

### 4.5.2 ACID Properties

Transactions guarantee four properties (known as ACID):

| Property | Meaning | Example |
|---|---|---|
| **Atomicity** | All operations succeed or all are rolled back | If one INSERT in a batch fails, all preceding INSERTs are undone |
| **Consistency** | The database moves from one valid state to another | Constraints are never violated, even temporarily |
| **Isolation** | Concurrent transactions do not interfere with each other | Two users updating the same row do not corrupt each other's changes |
| **Durability** | Once committed, changes survive crashes | A power failure after COMMIT does not lose data |

### 4.5.3 Using Transactions

```sql
-- Start a transaction
START TRANSACTION;

-- Make changes
UPDATE employees SET salary = salary * 1.10 WHERE department = 'Marketing';
UPDATE employees SET salary = salary * 1.05 WHERE department = 'Sales';

-- Check the results before committing
SELECT firstname, department, salary FROM employees;

-- If everything looks correct, make it permanent:
COMMIT;

-- If something went wrong, undo everything:
-- ROLLBACK;
```

### 4.5.4 Transaction Workflow

```
START TRANSACTION
      │
      ├── DML Statement 1 (UPDATE, INSERT, DELETE)
      ├── DML Statement 2
      ├── DML Statement 3
      │
      ├── Check results (SELECT)
      │
      ├── Everything OK? ──→ COMMIT  (changes are permanent)
      │
      └── Something wrong? ──→ ROLLBACK  (all changes are undone)
```

### 4.5.5 Practical Transaction Example

Let us safely experiment with the salesdb data:

```sql
USE salesdb;

-- Start a transaction so we can undo if needed
START TRANSACTION;

-- Delete all shipped orders (risky operation)
DELETE FROM orders WHERE orderstatus = 'Shipped';

-- Check how many orders remain
SELECT COUNT(*) AS remaining_orders FROM orders;
-- Oops — we deleted too many. Let's undo.

ROLLBACK;

-- Verify: all orders are back
SELECT COUNT(*) AS total_orders FROM orders;
-- Expected: 10 (all original rows restored)
```

This is the power of transactions: **you can experiment safely.** Any DML operation inside a transaction can be undone with ROLLBACK until you explicitly COMMIT.

### 4.5.6 Auto-Commit

By default, MySQL runs in **auto-commit mode**: every individual statement is automatically committed immediately after execution. There is no undo.

```sql
-- Check auto-commit status
SELECT @@autocommit;
-- Returns 1 (enabled)
```

When you explicitly call `START TRANSACTION`, auto-commit is temporarily disabled for that session until you `COMMIT` or `ROLLBACK`.

You can also disable auto-commit globally for a session:

```sql
-- Disable auto-commit for this session
SET autocommit = 0;

-- Now every statement must be explicitly committed
UPDATE employees SET salary = 100000 WHERE employeeid = 1;
-- This change is NOT yet permanent

COMMIT;  -- Now it is permanent
-- or
ROLLBACK;  -- Undo it
```

> **PostgreSQL difference**: PostgreSQL also defaults to auto-commit. The transaction syntax is `BEGIN` (instead of `START TRANSACTION`), `COMMIT`, and `ROLLBACK`.

### 4.5.7 When to Use Transactions

| Scenario | Use Transaction? |
|---|---|
| Single SELECT query | No — read-only, nothing to undo |
| Single INSERT of one row | Usually no — auto-commit is fine |
| Bulk INSERT (thousands of rows) | **Yes** — commit once at the end is much faster |
| UPDATE or DELETE on production data | **Yes, always** — verify results before committing |
| Multiple related changes (e.g., transfer between accounts) | **Yes, absolutely** — atomicity is essential |
| Running a script you have not tested | **Yes** — wrap in a transaction, review, then commit |

---

## 4.6 Loading Data from CSV Files

The `salesdb` asset folder includes CSV files that you can import. This is how real-world data loading often works.

### 4.6.1 LOAD DATA INFILE (MySQL)

```sql
-- Load data from a CSV file into a table
LOAD DATA INFILE 'C:/path/to/Customers.csv'
INTO TABLE customers
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;  -- Skip the header row
```

> ⚠️ **Security note**: `LOAD DATA INFILE` requires the `FILE` privilege and `secure_file_priv` must be configured to allow reading from the file's location. If you get a "file not found" or "access denied" error, check the MySQL variable:
> ```sql
> SHOW VARIABLES LIKE 'secure_file_priv';
> ```
> You may need to move the CSV to the directory specified by this variable.

### 4.6.2 Alternative: MySQL Workbench Import Wizard

The easier method for beginners:

1. Right-click the target table in the Schemas panel
2. Select **Table Data Import Wizard**
3. Browse to the CSV file
4. Map columns (the wizard auto-maps by header name)
5. Click **Next** and **Finish**

### 4.6.3 Using INSERT for Small CSV Data

For small datasets, you can manually convert CSV to INSERT statements:

The CSV file `Customers.csv`:
```
CustomerID,FirstName,LastName,Country,Score
1,Jossef,Goldberg,Germany,350
2,Kevin,Brown,USA,900
```

Becomes:
```sql
INSERT INTO customers (customerid, firstname, lastname, country, score) VALUES
    (1, 'Jossef', 'Goldberg', 'Germany', 350),
    (2, 'Kevin', 'Brown', 'USA', 900);
```

---

## 4.7 Practical DML Workflow: The Safe Approach

Before running any UPDATE or DELETE on real data, follow this workflow:

### Step 1: Write the SELECT First

Always write a SELECT with the same WHERE clause to see which rows will be affected:

```sql
-- PREVIEW: Which orders will be updated?
SELECT * FROM orders WHERE orderstatus = 'Shipped';
```

### Step 2: Count the Affected Rows

```sql
SELECT COUNT(*) FROM orders WHERE orderstatus = 'Shipped';
-- Result: 5 rows will be affected
```

### Step 3: Start a Transaction

```sql
START TRANSACTION;
```

### Step 4: Execute the DML

```sql
UPDATE orders SET orderstatus = 'Delivered' WHERE orderstatus = 'Shipped';
-- Query OK, 5 rows affected
```

### Step 5: Verify

```sql
SELECT * FROM orders WHERE orderstatus = 'Delivered';
-- Confirm the changes look correct
```

### Step 6: Commit or Rollback

```sql
COMMIT;    -- Make it permanent
-- or
ROLLBACK;  -- Undo everything
```

> **This workflow should become second nature.** It will save you from every "I accidentally deleted all the production data" horror story.

---

## Common Mistakes & Misconceptions

### Mistake 1: UPDATE/DELETE Without WHERE

```sql
-- ❌ CATASTROPHIC: Updates EVERY row
UPDATE employees SET salary = 50000;

-- ❌ CATASTROPHIC: Deletes EVERY row
DELETE FROM employees;
```

**Prevention**: MySQL Workbench has a "Safe Updates" mode (`Edit → Preferences → SQL Editor → Safe Updates`). When enabled, it blocks UPDATE and DELETE statements that lack a WHERE clause or a LIMIT.

### Mistake 2: Assuming DELETE Resets AUTO_INCREMENT

```sql
DELETE FROM students;           -- Removes all rows, AUTO_INCREMENT stays at 6
INSERT INTO students (first_name) VALUES ('New');
-- student_id will be 6, not 1

TRUNCATE TABLE students;        -- Removes all rows AND resets AUTO_INCREMENT to 1
INSERT INTO students (first_name) VALUES ('New');
-- student_id will be 1
```

### Mistake 3: Forgetting COMMIT After START TRANSACTION

```sql
START TRANSACTION;
INSERT INTO students (first_name) VALUES ('Frank');
-- ... you close MySQL Workbench or your connection drops ...
-- The INSERT is automatically rolled back! Frank is gone.
```

**Fix**: Always explicitly COMMIT when you are done.

### Mistake 4: Confusing REPLACE with UPDATE

```sql
-- REPLACE deletes the entire row and inserts a new one
-- Columns not specified get DEFAULT values, not the old values
REPLACE INTO students (student_id, first_name)
VALUES (1, 'Alice');
-- Alice's last_name, email, gpa are now NULL/default — NOT their old values

-- UPDATE preserves unmentioned columns
UPDATE students SET first_name = 'Alice' WHERE student_id = 1;
-- Only first_name changes. All other columns keep their existing values.
```

### Mistake 5: INSERT INTO ... SELECT Without Matching Columns

```sql
-- ❌ Column count mismatch
INSERT INTO students_backup (first_name, last_name)
SELECT * FROM students;
-- ERROR: Column count doesn't match value count

-- ✅ Select only the columns you need
INSERT INTO students_backup (first_name, last_name)
SELECT first_name, last_name FROM students;
```

---

## Practice Exercises

### Beginner

**Exercise 4.1**: Switch to `Parks_and_Recreation`. Insert a new employee into `employee_salary`:
- employee_id: 13
- first_name: 'Jean-Ralphio'
- last_name: 'Saperstein'
- occupation: 'Entertainment'
- salary: 0
- dept_id: 1

**Exercise 4.2**: Update Jerry Gergich's salary to 55000 in the `employee_salary` table.

**Exercise 4.3**: Delete Mark Brendanawicz from the `employee_salary` table (employee_id = 11).

**Exercise 4.4**: Insert 3 new departments into `parks_departments`: 'IT', 'Legal', and 'Maintenance'.

### Intermediate

**Exercise 4.5**: Using `salesdb`, write a transaction that:
1. Increases all Marketing employees' salaries by 15%
2. Checks the result with a SELECT
3. Rolls back the change (do not commit)

Verify that the salaries returned to their original values.

**Exercise 4.6**: Create a table `delivered_orders` and populate it using `INSERT INTO ... SELECT` with all orders from `salesdb.orders` that have `orderstatus = 'Delivered'`.

**Exercise 4.7**: Write an UPDATE statement that sets `billaddress` to the value of `shipaddress` for all orders where `billaddress` is NULL.

**Exercise 4.8**: Use `INSERT ... ON DUPLICATE KEY UPDATE` to insert a customer with `customerid = 3`. If they already exist, update their `score` to 800.

### Challenge

**Exercise 4.9**: Write a transaction that simulates a "salary transfer" between two employees:
1. Decrease Frank Lee's salary by 5000
2. Increase Mary's salary by 5000
3. Verify that the total salary across all employees did not change
4. Commit the transaction

**Exercise 4.10**: The `orders_archive` table has duplicate `orderid` values (check orderid 4 and 6). Write a DELETE statement that removes the duplicate rows, keeping only the row with the latest `creationtime` for each `orderid`. This is a common real-world data cleaning task.

> **Hint**: You may need a subquery or a self-join to identify which rows to keep.

---

## Key Takeaways

1. **INSERT adds rows.** Use multi-row INSERT for bulk data. Use `INSERT INTO ... SELECT` to copy data between tables.

2. **UPDATE modifies existing rows.** Always include a WHERE clause unless you intentionally want to update every row. Preview with SELECT first.

3. **DELETE removes rows.** It is DML (can be rolled back in a transaction). TRUNCATE is DDL (cannot be rolled back, but is faster). DROP removes the entire table.

4. **Transactions group operations atomically.** `START TRANSACTION` → do your work → `COMMIT` (permanent) or `ROLLBACK` (undo). Use transactions for any risky DML operation.

5. **Auto-commit is on by default in MySQL.** Every statement you run outside a transaction is immediately permanent. There is no undo without an explicit transaction.

6. **The Safe DML Workflow**: SELECT first (preview) → COUNT (verify scope) → START TRANSACTION → execute DML → verify → COMMIT or ROLLBACK.

7. **REPLACE deletes then inserts** — it does not preserve unmentioned column values. Use `INSERT ... ON DUPLICATE KEY UPDATE` for true upsert behaviour.

8. **Always back up before bulk operations.** `CREATE TABLE backup AS SELECT * FROM target;` is your safety net.

---

## PostgreSQL Assignment

**PG-4.1**: In PostgreSQL's `salesdb`, insert a new customer into `sales.customers`:
```sql
INSERT INTO sales.customers VALUES (6, 'Lisa', 'Park', 'Canada', 600);
```

**PG-4.2**: Write a PostgreSQL upsert using `ON CONFLICT`:
```sql
INSERT INTO sales.customers (customerid, firstname, lastname, country, score)
VALUES (6, 'Lisa', 'Park', 'Canada', 650)
ON CONFLICT (customerid) DO UPDATE SET
    score = EXCLUDED.score;
```
Explain what `EXCLUDED` refers to.

**PG-4.3**: Use `BEGIN` (the PostgreSQL equivalent of `START TRANSACTION`) to wrap a DELETE in a transaction. Delete all orders with `quantity = 0`, verify, then ROLLBACK.

---

## Next Chapter

→ **Chapter 5 — Filtering Data**: You know how to read, create, and modify data. Now learn how to precisely target the exact rows you need using the WHERE clause, comparison operators, pattern matching, NULL logic, and more.
