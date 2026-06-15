# Chapter 3 - Data Definition (DDL)

---

## Chapter Overview

So far, you have queried data from existing tables. But who created those tables? Who decided that `customers` should have columns called `firstname`, `lastname`, `country`, and `score`? Who defined that `score` is an integer and not text?

That is what **Data Definition Language (DDL)** is for. DDL is the set of SQL commands that define and modify the *structure* of databases and tables - the containers that hold data. In this chapter, you will learn to create databases, design tables with appropriate data types, enforce data integrity through constraints, and modify existing structures safely.

This is where you transition from being someone who *reads* data to someone who *architects* data.

### Prerequisites

- Completed Chapters 1 and 2
- `salesdb` loaded (for reference - we will study its structure)

### Database Used

In this chapter, you will **build databases and tables from scratch**. You will also reference `salesdb` to understand how a well-designed schema is structured.

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Create and drop databases
2. Create tables with appropriate data types for each column
3. Choose the correct data type for a given scenario (INT vs DECIMAL, VARCHAR vs CHAR vs TEXT, DATE vs DATETIME vs TIMESTAMP)
4. Define constraints: PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, CHECK, FOREIGN KEY
5. Explain the difference between natural and surrogate keys
6. Use `AUTO_INCREMENT` (MySQL) and `SERIAL` (PostgreSQL) for auto-generated IDs
7. Modify existing tables with `ALTER TABLE`
8. Understand `DROP TABLE` vs `TRUNCATE TABLE` and when to use each
9. Create a table from a query with `CREATE TABLE ... AS SELECT`

---

## 3.1 Creating and Managing Databases

### 3.1.1 CREATE DATABASE

A database is the top-level container. It holds tables, views, stored procedures, and other objects.

```sql
-- Create a new database
CREATE DATABASE my_practice_db;
```

To use it:

```sql
USE my_practice_db;
```

### 3.1.2 Checking If a Database Exists

If the database already exists, `CREATE DATABASE` will fail with an error. Use `IF NOT EXISTS` to prevent this:

```sql
-- Only create if it doesn't already exist
CREATE DATABASE IF NOT EXISTS my_practice_db;
```

### 3.1.3 Character Set and Collation

When creating a database, you can specify the character encoding and collation (sorting rules):

```sql
CREATE DATABASE my_practice_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

- **`utf8mb4`**: Full Unicode support (including emojis). Always use this over `utf8` in MySQL.
- **`utf8mb4_unicode_ci`**: Case-insensitive (`ci`) sorting based on Unicode rules. This means `'ABC'` = `'abc'` in comparisons and sorting.

> **Best practice**: Always specify `utf8mb4` unless you have a specific reason not to. The default `utf8` in MySQL is actually `utf8mb3` (3-byte UTF-8), which cannot store characters outside the Basic Multilingual Plane (like emojis or some Asian scripts).

### 3.1.4 DROP DATABASE

```sql
-- Permanently delete a database and ALL its contents
DROP DATABASE my_practice_db;
```

> ⚠️ **DANGER**: `DROP DATABASE` is irreversible. It deletes the database, every table in it, and all data. There is no "undo." Always double-check the database name before executing.

Safer version:

```sql
DROP DATABASE IF EXISTS my_practice_db;
```

### 3.1.5 Listing Databases

```sql
SHOW DATABASES;
```

> **PostgreSQL equivalent**: `SELECT datname FROM pg_database;` or `\l` in psql.

---

## 3.2 Creating Tables

### 3.2.1 Basic CREATE TABLE

```sql
CREATE DATABASE IF NOT EXISTS my_practice_db;
USE my_practice_db;

CREATE TABLE students (
    student_id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    enrollment_date DATE,
    gpa DECIMAL(3, 2)
);
```

Breaking this down:
- `CREATE TABLE students` - creates a table named `students`
- Each line inside the parentheses defines a **column**: `column_name DATA_TYPE`
- `INT` - whole number
- `VARCHAR(50)` - variable-length text, maximum 50 characters
- `DATE` - date value (YYYY-MM-DD)
- `DECIMAL(3, 2)` - decimal number with 3 total digits and 2 after the decimal point (e.g., `3.85`)

### 3.2.2 Verifying Table Structure

```sql
-- Show the table structure
DESCRIBE students;
-- or
DESC students;
```

| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| student_id | int | YES | | NULL | |
| first_name | varchar(50) | YES | | NULL | |
| last_name | varchar(50) | YES | | NULL | |
| email | varchar(100) | YES | | NULL | |
| enrollment_date | date | YES | | NULL | |
| gpa | decimal(3,2) | YES | | NULL | |

Notice: all columns allow NULL and have no keys or defaults. This is a bare-minimum table. We will add constraints shortly.

---

## 3.3 Data Types - The Complete Guide

Choosing the right data type is one of the most important schema design decisions. The wrong choice leads to wasted storage, incorrect calculations, or data that cannot be stored at all.

### 3.3.1 Numeric Types

#### Integer Types

| Type | Storage | Range (Signed) | Range (Unsigned) | Use Case |
|---|---|---|---|---|
| `TINYINT` | 1 byte | -128 to 127 | 0 to 255 | Boolean flags, status codes |
| `SMALLINT` | 2 bytes | -32,768 to 32,767 | 0 to 65,535 | Small counts (e.g., order quantity) |
| `MEDIUMINT` | 3 bytes | -8.3M to 8.3M | 0 to 16.7M | Medium-range IDs |
| `INT` | 4 bytes | -2.1B to 2.1B | 0 to 4.3B | **Most common integer type** - IDs, counts, amounts |
| `BIGINT` | 8 bytes | -9.2×10¹⁸ to 9.2×10¹⁸ | 0 to 1.8×10¹⁹ | Very large numbers (social media IDs, big data) |

> **Rule of thumb**: Use `INT` unless you have a reason to use something else. Use `BIGINT` if the values could exceed 2 billion.

#### Decimal Types

| Type | Storage | Precision | Use Case |
|---|---|---|---|
| `DECIMAL(p, s)` | Varies | Exact (up to 65 digits) | **Money, financial data** - no rounding errors |
| `FLOAT` | 4 bytes | ~7 significant digits | Scientific measurements - rounding is acceptable |
| `DOUBLE` | 8 bytes | ~15 significant digits | Scientific measurements - more precision than FLOAT |

> ⚠️ **Never use FLOAT or DOUBLE for money.** They introduce floating-point rounding errors. `0.1 + 0.2` might become `0.30000000000000004`. Use `DECIMAL(10, 2)` for monetary values.

```sql
-- DECIMAL(10, 2) means: 10 total digits, 2 after the decimal
-- Maximum value: 99999999.99
-- Examples: 150.50, 99999999.99, 0.01

-- DECIMAL(3, 2) means: 3 total digits, 2 after the decimal
-- Maximum value: 9.99
-- Examples: 3.85, 0.50, 9.99
```

### 3.3.2 String Types

| Type | Storage | Max Length | Use Case |
|---|---|---|---|
| `CHAR(n)` | Fixed n bytes | 255 | Fixed-length codes: country codes (`CHAR(2)`), gender (`CHAR(1)`), postal codes |
| `VARCHAR(n)` | Variable (up to n) | 65,535 | **Most common string type** - names, emails, addresses |
| `TEXT` | Variable | 65,535 | Long text - descriptions, comments, notes |
| `MEDIUMTEXT` | Variable | 16.7MB | Articles, documentation |
| `LONGTEXT` | Variable | 4.3GB | Very large text - rarely needed |
| `ENUM('a','b','c')` | 1-2 bytes | N/A | Fixed set of values: status ('Active', 'Inactive'), gender ('M', 'F') |

**CHAR vs VARCHAR**:

```
CHAR(10) storing 'Hello':     |H|e|l|l|o| | | | | |  → Always uses 10 bytes
VARCHAR(10) storing 'Hello':  |H|e|l|l|o|             → Uses 5 bytes + 1 byte overhead
```

Use `CHAR` when all values are the same length (e.g., country codes, gender). Use `VARCHAR` for everything else.

### 3.3.3 Date and Time Types

| Type | Format | Range | Storage | Use Case |
|---|---|---|---|---|
| `DATE` | `YYYY-MM-DD` | 1000-01-01 to 9999-12-31 | 3 bytes | Birthdays, hire dates, order dates |
| `TIME` | `HH:MM:SS` | -838:59:59 to 838:59:59 | 3 bytes | Duration, time of day |
| `DATETIME` | `YYYY-MM-DD HH:MM:SS` | 1000-01-01 to 9999-12-31 | 8 bytes | Event timestamps where timezone is not needed |
| `TIMESTAMP` | `YYYY-MM-DD HH:MM:SS` | 1970-01-01 to 2038-01-19 | 4 bytes | Record creation/modification times - auto-converts to UTC |
| `YEAR` | `YYYY` | 1901 to 2155 | 1 byte | Year only |

**DATETIME vs TIMESTAMP**:
- `DATETIME` stores the exact date and time you give it. No timezone conversion.
- `TIMESTAMP` converts to UTC on storage and back to the session timezone on retrieval. It is aware of timezone changes.
- `TIMESTAMP` has a limited range (up to year 2038 - the "Year 2038 problem").
- **Use TIMESTAMP** for audit fields (`created_at`, `updated_at`). **Use DATETIME** for business dates that should not change with timezone (meeting times, event dates).

### 3.3.4 MySQL vs PostgreSQL Data Type Comparison

| Concept | MySQL | PostgreSQL |
|---|---|---|
| Auto-increment integer | `INT AUTO_INCREMENT` | `SERIAL` or `INT GENERATED ALWAYS AS IDENTITY` |
| Boolean | `TINYINT(1)` or `BOOLEAN` (alias) | Native `BOOLEAN` (true/false) |
| Variable text | `VARCHAR(n)` | `VARCHAR(n)` or `TEXT` (no length limit) |
| Fixed text | `CHAR(n)` | `CHAR(n)` |
| Exact decimal | `DECIMAL(p,s)` | `NUMERIC(p,s)` or `DECIMAL(p,s)` |
| Timestamp | `TIMESTAMP` (auto UTC convert) | `TIMESTAMP` or `TIMESTAMPTZ` (with timezone) |
| JSON | `JSON` | `JSON` or `JSONB` (binary JSON - faster queries) |
| Enum | `ENUM('a', 'b', 'c')` | `CREATE TYPE ... AS ENUM(...)` (must define separately) |
| UUID | `CHAR(36)` or `BINARY(16)` | Native `UUID` type |

---

## 3.4 Constraints

Constraints enforce rules on the data in your tables. They are the database's defence against bad data.

### 3.4.1 PRIMARY KEY

A primary key uniquely identifies each row in a table. Every table should have one.

Rules:
- Must be **unique** - no two rows can have the same primary key value
- Must be **NOT NULL** - a primary key cannot be empty
- A table can have only **one** primary key (but it can span multiple columns - a "composite key")

```sql
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);
```

Or the explicit constraint syntax (preferred for readability):

```sql
CREATE TABLE students (
    student_id INT NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    PRIMARY KEY (student_id)
);
```

### 3.4.2 AUTO_INCREMENT

Manually assigning IDs is tedious and error-prone. `AUTO_INCREMENT` lets MySQL generate the next ID automatically:

```sql
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    PRIMARY KEY (student_id)
);

-- Insert without specifying student_id - MySQL assigns 1, 2, 3, ...
INSERT INTO students (first_name, last_name) VALUES ('Alice', 'Smith');
INSERT INTO students (first_name, last_name) VALUES ('Bob', 'Jones');
INSERT INTO students (first_name, last_name) VALUES ('Carol', 'Williams');

SELECT * FROM students;
```

| student_id | first_name | last_name |
|---|---|---|
| 1 | Alice | Smith |
| 2 | Bob | Jones |
| 3 | Carol | Williams |

> **PostgreSQL equivalent**: Use `SERIAL`:
> ```sql
> CREATE TABLE students (
>     student_id SERIAL PRIMARY KEY,
>     first_name VARCHAR(50) NOT NULL,
>     last_name VARCHAR(50)
> );
> ```

### 3.4.3 NOT NULL

Prevents a column from accepting NULL values:

```sql
CREATE TABLE students (
    student_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,    -- Required
    last_name VARCHAR(50),              -- Optional (can be NULL)
    email VARCHAR(100) NOT NULL,        -- Required
    PRIMARY KEY (student_id)
);

-- ✅ Works
INSERT INTO students (first_name, email) VALUES ('Alice', 'alice@example.com');

-- ❌ Fails: first_name is NOT NULL
INSERT INTO students (last_name, email) VALUES ('Smith', 'smith@example.com');
-- ERROR 1364: Field 'first_name' doesn't have a default value
```

### 3.4.4 UNIQUE

Ensures no two rows have the same value in this column (NULLs are excluded - multiple NULLs are allowed):

```sql
CREATE TABLE students (
    student_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,  -- No duplicate emails allowed
    PRIMARY KEY (student_id)
);

INSERT INTO students (first_name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO students (first_name, email) VALUES ('Bob', 'alice@example.com');
-- ERROR 1062: Duplicate entry 'alice@example.com' for key 'email'
```

### 3.4.5 DEFAULT

Provides a default value when no value is specified during insertion:

```sql
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(20) DEFAULT 'Active',
    gpa DECIMAL(3, 2) DEFAULT 0.00,
    PRIMARY KEY (student_id)
);

INSERT INTO students (first_name) VALUES ('Alice');
SELECT * FROM students;
```

| student_id | first_name | enrollment_date | status | gpa |
|---|---|---|---|---|
| 1 | Alice | 2026-06-11 | Active | 0.00 |

Alice gets today's date, 'Active' status, and 0.00 GPA automatically.

### 3.4.6 CHECK

Validates that values meet a condition:

```sql
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    age INT CHECK (age >= 16 AND age <= 100),
    gpa DECIMAL(3, 2) CHECK (gpa >= 0.00 AND gpa <= 4.00),
    PRIMARY KEY (student_id)
);

-- ✅ Works
INSERT INTO students (first_name, age, gpa) VALUES ('Alice', 20, 3.85);

-- ❌ Fails: age must be >= 16
INSERT INTO students (first_name, age, gpa) VALUES ('Bob', 12, 3.50);
-- ERROR 3819: Check constraint 'students_chk_1' is violated
```

> **Note**: MySQL 8.0.16+ supports CHECK constraints. Older versions silently accept but do not enforce them.

### 3.4.7 FOREIGN KEY

A foreign key creates a link between two tables. It ensures that a value in one table references a valid value in another table.

```sql
-- Step 1: Create the referenced (parent) table first
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT,
    course_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    PRIMARY KEY (course_id)
);

-- Step 2: Create the referencing (child) table
CREATE TABLE students (
    student_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    PRIMARY KEY (student_id)
);

-- Step 3: Create a junction table with foreign keys to both
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    grade CHAR(2),
    PRIMARY KEY (enrollment_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

Now let us see the foreign key in action:

```sql
-- Insert valid data
INSERT INTO students (first_name, last_name) VALUES ('Alice', 'Smith');
INSERT INTO courses (course_name) VALUES ('Introduction to SQL');

-- ✅ Works: student_id 1 exists, course_id 1 exists
INSERT INTO enrollments (student_id, course_id) VALUES (1, 1);

-- ❌ Fails: student_id 99 does not exist
INSERT INTO enrollments (student_id, course_id) VALUES (99, 1);
-- ERROR 1452: Cannot add or update a child row: a foreign key constraint fails
```

### 3.4.8 ON DELETE Behaviour

What happens to child rows when the parent row is deleted?

```sql
-- Option 1: RESTRICT (default) - Block the deletion
FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT

-- Option 2: CASCADE - Delete child rows automatically
FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

-- Option 3: SET NULL - Set the foreign key to NULL in child rows
FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL
```

| Behaviour | What Happens When Parent Is Deleted | Use Case |
|---|---|---|
| `RESTRICT` | Deletion is blocked with an error | Default. Safe. Prevents accidental data loss. |
| `CASCADE` | Child rows are automatically deleted too | When child data has no meaning without the parent (e.g., order items without an order) |
| `SET NULL` | Foreign key column in child rows is set to NULL | When you want to keep the child row but mark it as "no longer associated" (e.g., employee's manager is fired) |

> **In the `salesdb` schema**: Look at the `employees` table - `managerid` has `ON DELETE SET NULL`. If a manager is deleted, their reports' `managerid` becomes NULL rather than cascading the deletion.

---

## 3.5 Studying the salesdb Schema

Now that you understand data types, constraints, and foreign keys, let us examine how the `salesdb` was designed:

```sql
USE salesdb;
DESCRIBE customers;
DESCRIBE employees;
DESCRIBE products;
DESCRIBE orders;
```

### 3.5.1 Key Design Decisions in salesdb

| Table | Design Decision | Reasoning |
|---|---|---|
| `customers` | `customerid INT NOT NULL PRIMARY KEY` | Surrogate key - simple integer |
| `customers` | `score INT` (nullable) | Some customers may not have a score yet |
| `employees` | `managerid INT` with self-reference FK | Employee-manager hierarchy using the same table |
| `employees` | `ON DELETE SET NULL` for managerid | If a manager is deleted, reports should remain but lose their manager reference |
| `orders` | Three foreign keys: productid, customerid, salespersonid | Each order links to a product, customer, and salesperson |
| `orders` | All FKs use `ON DELETE SET NULL` | If a referenced record is deleted, the order remains but the reference is nullified |
| `orders_archive` | No primary key, no foreign keys | Archive tables often relax constraints for flexibility - this one allows duplicate orderids (notice orderid 4 and 6 appear multiple times) |

---

## 3.6 ALTER TABLE

`ALTER TABLE` modifies an existing table's structure. This is how you evolve a schema without dropping and recreating the table.

### 3.6.1 Adding a Column

```sql
-- Add a phone column to the students table
ALTER TABLE students 
ADD COLUMN phone VARCHAR(20);
```

### 3.6.2 Dropping a Column

```sql
-- Remove the phone column
ALTER TABLE students 
DROP COLUMN phone;
```

### 3.6.3 Modifying a Column's Data Type

```sql
-- Change last_name from VARCHAR(50) to VARCHAR(100)
ALTER TABLE students 
MODIFY COLUMN last_name VARCHAR(100);
```

### 3.6.4 Renaming a Column

```sql
-- Rename 'gpa' to 'grade_point_average'
ALTER TABLE students 
CHANGE COLUMN gpa grade_point_average DECIMAL(3, 2);
```

> **PostgreSQL equivalent**: `ALTER TABLE students RENAME COLUMN gpa TO grade_point_average;`

### 3.6.5 Adding a Constraint After Table Creation

```sql
-- Add a UNIQUE constraint to email
ALTER TABLE students 
ADD CONSTRAINT uq_student_email UNIQUE (email);

-- Add a CHECK constraint
ALTER TABLE students 
ADD CONSTRAINT chk_gpa CHECK (grade_point_average >= 0.00 AND grade_point_average <= 4.00);
```

### 3.6.6 Dropping a Constraint

```sql
-- Drop a named constraint
ALTER TABLE students 
DROP CONSTRAINT uq_student_email;

-- Drop a foreign key (MySQL requires the constraint name)
ALTER TABLE enrollments 
DROP FOREIGN KEY enrollments_ibfk_1;
```

### 3.6.7 Renaming a Table

```sql
RENAME TABLE students TO university_students;
-- or
ALTER TABLE university_students RENAME TO students;
```

---

## 3.7 DROP TABLE vs TRUNCATE TABLE

Both remove data, but they are fundamentally different operations:

| Aspect | `DROP TABLE` | `TRUNCATE TABLE` |
|---|---|---|
| What it does | Removes the table structure AND all data | Removes all data but keeps the table structure |
| After execution | Table no longer exists | Table exists but is empty |
| AUTO_INCREMENT | N/A (table is gone) | Resets to 1 |
| Can use WHERE? | No | No |
| Speed | Fast | Very fast (faster than DELETE for large tables) |
| Rollback | Cannot be rolled back | Cannot be rolled back (DDL operation) |

```sql
-- Remove all data, keep the table
TRUNCATE TABLE students;

-- Remove the table entirely
DROP TABLE students;

-- Safe version
DROP TABLE IF EXISTS students;
```

> **TRUNCATE vs DELETE**: `DELETE FROM students;` also removes all rows, but it is a DML operation that can be rolled back within a transaction, fires triggers, and is much slower for large tables. Use `TRUNCATE` when you want to empty a table quickly and do not need undo capability.

---

## 3.8 CREATE TABLE ... AS SELECT (CTAS)

Create a new table by copying the result of a query:

```sql
USE salesdb;

-- Create a backup of the customers table
CREATE TABLE customers_backup AS
SELECT * FROM customers;

-- Create a table of only German customers
CREATE TABLE german_customers AS
SELECT customerid, firstname, lastname, score
FROM customers
WHERE country = 'Germany';

SELECT * FROM german_customers;
```

| customerid | firstname | lastname | score |
|---|---|---|---|
| 1 | Jossef | Goldberg | 350 |
| 4 | Mark | Schwarz | 500 |

> ⚠️ **CTAS does NOT copy constraints.** The new table will not have primary keys, foreign keys, AUTO_INCREMENT, or other constraints from the original. It copies only the data and basic column definitions. You must add constraints separately with `ALTER TABLE`.

---

## 3.9 Schema Design Principles

Good schema design follows these principles:

### 3.9.1 Naming Conventions

| Convention | Example | Notes |
|---|---|---|
| Use lowercase | `customers`, `order_items` | Avoids case-sensitivity issues across OS |
| Use underscores for multi-word names | `first_name`, `order_date` | More readable than `firstname` or `orderDate` |
| Table names: plural | `customers`, `orders`, `products` | A table holds many records |
| Primary key: `tablename_id` or `id` | `customer_id`, `order_id` | Consistent naming makes JOINs intuitive |
| Foreign key: match the referenced column name | `customer_id` in `orders` → `customer_id` in `customers` | Self-documenting relationships |
| Avoid reserved words | Don't name a column `order`, `select`, `group` | Use `orders`, `order_date` instead |

### 3.9.2 Natural vs Surrogate Keys

| Key Type | Description | Example | Pros | Cons |
|---|---|---|---|---|
| **Natural** | A key that has real-world meaning | Email address, SSN, ISBN | Meaningful, no extra column needed | Can change (email updates), may be complex (composite), privacy concerns |
| **Surrogate** | An artificial key with no business meaning | Auto-incremented integer, UUID | Simple, stable, never changes | No business meaning, extra column |

> **Recommendation**: Use **surrogate keys** (auto-increment integers) for primary keys. They are simple, performant, and never need to change. Use natural keys as UNIQUE constraints when they exist (e.g., `email UNIQUE`).

---

## Common Mistakes & Misconceptions

### Mistake 1: Forgetting That CREATE TABLE Order Matters for Foreign Keys

```sql
-- ❌ Fails: can't reference 'students' before it exists
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY,
    student_id INT REFERENCES students(student_id)
);
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(50)
);
```

**Fix**: Create parent tables before child tables.

### Mistake 2: Using FLOAT for Money

```sql
-- ❌ Wrong: FLOAT introduces rounding errors
CREATE TABLE invoices (
    amount FLOAT
);

-- ✅ Correct: DECIMAL is exact
CREATE TABLE invoices (
    amount DECIMAL(10, 2)
);
```

### Mistake 3: Using VARCHAR Without a Length

```sql
-- ❌ Error in MySQL: length is required
CREATE TABLE example (
    name VARCHAR
);
-- ERROR 1064: You have an error in your SQL syntax
```

> **PostgreSQL exception**: PostgreSQL allows `VARCHAR` without a length (unlimited). MySQL does not.

### Mistake 4: Choosing Excessively Large Data Types

```sql
-- ❌ Overkill: BIGINT for a table that will never exceed 1,000 rows
CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY
);

-- ✅ Better: INT is sufficient for billions of rows
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY
);
```

### Mistake 5: Not Using IF EXISTS / IF NOT EXISTS

```sql
-- ❌ Script fails on second run
DROP TABLE students;
CREATE TABLE students (...);

-- ✅ Script is safe to run multiple times
DROP TABLE IF EXISTS students;
CREATE TABLE students (...);
```

---

## Practice Exercises

### Beginner

**Exercise 3.1**: Create a database called `school_db` and switch to it.

**Exercise 3.2**: Create a table called `teachers` with these columns:
- `teacher_id` - integer, auto-increment, primary key
- `first_name` - text up to 50 characters, required
- `last_name` - text up to 50 characters
- `subject` - text up to 50 characters, required
- `hire_date` - date, defaults to the current date

**Exercise 3.3**: Add a column `salary` (decimal with 10 total digits and 2 decimal places) to the `teachers` table.

**Exercise 3.4**: Insert 3 teachers into the table (use your own data). Verify with `SELECT * FROM teachers;`.

### Intermediate

**Exercise 3.5**: Create a table called `classes` with:
- `class_id` (INT, auto-increment, PK)
- `class_name` (VARCHAR(100), NOT NULL, UNIQUE)
- `teacher_id` (INT, foreign key referencing `teachers.teacher_id`)
- `max_students` (INT, CHECK >= 1 and <= 40, DEFAULT 30)

**Exercise 3.6**: Create a junction table `class_enrollments` to link students and classes (many-to-many relationship).

**Exercise 3.7**: Run `DESCRIBE` on the `salesdb.orders` table. Identify all the foreign key relationships. What do the `ON DELETE` behaviours mean for each?

**Exercise 3.8**: Use `CREATE TABLE ... AS SELECT` to create a table called `high_earners` from the `salesdb.employees` table containing only employees with a salary above 60,000.

### Challenge

**Exercise 3.9**: Design a complete database schema for a **library system** from scratch. It should include at minimum:
- `books` (book_id, title, author, isbn, published_year, genre, available_copies)
- `members` (member_id, first_name, last_name, email, join_date)
- `borrowings` (borrowing_id, book_id, member_id, borrow_date, return_date, status)

Include appropriate data types, primary keys, foreign keys, NOT NULL constraints, CHECK constraints, and DEFAULT values. Write the full CREATE TABLE statements.

**Exercise 3.10**: After creating the library schema, load it with at least 5 books, 3 members, and 4 borrowings. Ensure foreign key relationships are valid.

---

## Key Takeaways

1. **DDL defines structure, not data.** `CREATE`, `ALTER`, `DROP`, and `TRUNCATE` operate on the schema (tables, databases), not on the rows inside them.

2. **Choose data types deliberately.** `INT` for IDs and counts, `DECIMAL` for money, `VARCHAR` for variable-length text, `DATE` for dates, `TIMESTAMP` for audit fields. Never use FLOAT for financial data.

3. **Constraints protect your data.** `PRIMARY KEY` enforces uniqueness and identity. `NOT NULL` prevents missing values. `FOREIGN KEY` enforces referential integrity between tables. `CHECK` validates business rules.

4. **`AUTO_INCREMENT` (MySQL) or `SERIAL` (PostgreSQL)** generates unique IDs automatically. Always use surrogate keys for primary keys.

5. **`ALTER TABLE` evolves schema without data loss.** Add columns, modify types, add constraints - all without dropping the table.

6. **`DROP TABLE` is permanent.** `TRUNCATE TABLE` empties data but preserves structure. `DELETE` is the only DML alternative (slower but transactional). Always use `IF EXISTS` for safety.

7. **Create parent tables before child tables.** Foreign keys require the referenced table to exist first.

8. **`CREATE TABLE ... AS SELECT` copies data but not constraints.** You must add primary keys, foreign keys, and other constraints manually after creating the copy.

---

## PostgreSQL Assignment

**PG-3.1**: Create a database `pg_school_db` in PostgreSQL. Create the `teachers` table using `SERIAL` instead of `AUTO_INCREMENT`.

**PG-3.2**: In PostgreSQL, create a table with an `ENUM` type for status. Note: PostgreSQL requires you to create the enum type separately before using it:

```sql
CREATE TYPE enrollment_status AS ENUM ('Active', 'Withdrawn', 'Completed');
CREATE TABLE pg_enrollments (
    id SERIAL PRIMARY KEY,
    status enrollment_status DEFAULT 'Active'
);
```

Compare this to how MySQL handles ENUM inline in the column definition.

**PG-3.3**: Create a table in PostgreSQL using `GENERATED ALWAYS AS IDENTITY` instead of `SERIAL`. Research the difference and note which is recommended for new PostgreSQL code.

---

## Next Chapter

→ **Chapter 4 - Data Manipulation (DML)**: Now that you can create tables, it is time to fill them with data - and learn how to insert, update, and delete rows safely using transactions.
