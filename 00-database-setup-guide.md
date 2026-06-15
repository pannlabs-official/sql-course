# Database Setup Guide

> **Complete this guide before starting Chapter 1.**  
> Every example and exercise in this course depends on having these databases loaded and accessible.

---

## Table of Contents

1. [Installing MySQL](#1-installing-mysql)
2. [Installing PostgreSQL](#2-installing-postgresql)
3. [Loading the Course Databases](#3-loading-the-course-databases)
4. [Verifying Your Setup](#4-verifying-your-setup)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Installing MySQL

### 1.1 Download MySQL Server

1. Go to [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Select your operating system (Windows, macOS, or Linux)
3. Download **MySQL Community Server 8.0+** (the free version)
4. Choose the **MSI Installer** (Windows) or **DMG** (macOS) for the easiest setup

### 1.2 Installation (Windows)

1. Run the downloaded installer
2. Choose **Custom** installation type
3. Select these components:
   - **MySQL Server 8.x** - the database engine
   - **MySQL Workbench** - the graphical query tool
   - **MySQL Shell** - the command-line interface (optional but recommended)
4. Click **Next** through the configuration steps:
   - **Type and Networking**: Keep defaults (port `3306`, TCP/IP enabled)
   - **Authentication Method**: Choose "Use Strong Password Encryption" (recommended)
   - **Accounts and Roles**: Set a **root password**. **Write this down.** You will need it every time you connect.
   - **Windows Service**: Keep defaults (start at system startup)
5. Click **Execute** to apply configuration
6. Click **Finish**

### 1.3 Installation (macOS)

1. Run the downloaded DMG
2. Follow the installer prompts
3. When asked, set a **root password** and write it down
4. The MySQL preference pane will appear in System Preferences - use it to start/stop the server
5. Download MySQL Workbench separately from [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)

### 1.4 Verify MySQL Installation

Open **MySQL Workbench** and create a new connection:

- **Connection Name**: `Local MySQL`
- **Hostname**: `127.0.0.1`
- **Port**: `3306`
- **Username**: `root`
- **Password**: Click "Store in Vault" and enter your root password

Click **Test Connection**. You should see "Successfully made the MySQL connection."

Then open the connection and run:

```sql
SELECT VERSION();
```

Expected output - something like:

| VERSION() |
|---|
| 8.0.36 |

If you see a version number, MySQL is working.

---

## 2. Installing PostgreSQL

### 2.1 Download PostgreSQL

1. Go to [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Select your operating system
3. For Windows/macOS: Use the **EnterpriseDB installer** (the most common method)
4. Download **PostgreSQL 15+**

### 2.2 Installation (Windows)

1. Run the downloaded installer
2. Select components:
   - **PostgreSQL Server** - the database engine
   - **pgAdmin 4** - the graphical query tool
   - **Command Line Tools** - required
   - **Stack Builder** - optional (you can skip this)
3. Set the **installation directory** (keep default)
4. Set the **data directory** (keep default)
5. Set a **superuser password** for the `postgres` user. **Write this down.**
6. **Port**: Keep default `5432`
7. **Locale**: Keep default
8. Click through to complete installation

### 2.3 Installation (macOS)

1. Run the downloaded installer
2. Follow the same steps as Windows
3. Alternatively, use Homebrew: `brew install postgresql@15`

### 2.4 Verify PostgreSQL Installation

Open **pgAdmin 4**:

1. In the left panel, expand **Servers**
2. You should see a local PostgreSQL server. Click on it.
3. Enter the `postgres` superuser password when prompted
4. Right-click the server → **Query Tool**
5. Run:

```sql
SELECT version();
```

Expected output - something like:

| version |
|---|
| PostgreSQL 15.6 on x86_64-pc-linux-gnu, compiled by... |

If you see a version string, PostgreSQL is working.

---

## 3. Loading the Course Databases

You need to load **6 databases** into MySQL and **2 databases** into PostgreSQL. All SQL scripts are in the `assets/` folder.

### 3.1 Loading Databases into MySQL

Open **MySQL Workbench**, connect to your local server, and run each script in order.

#### Database 1: `MyDatabase` (Introductory)

**Script**: `assets/sql-ultimate-course-main/datasets/mysql/init-mysql-mydatabase.sql`

**What it creates**:
- Database `MyDatabase` with 2 tables: `customers` (5 rows) and `orders` (4 rows)

**How to load**:
1. In MySQL Workbench, go to **File → Open SQL Script**
2. Navigate to the script file above
3. Click the ⚡ **Execute** button (or press `Ctrl+Shift+Enter`)
4. Verify:

```sql
USE MyDatabase;
SHOW TABLES;
```

Expected:

| Tables_in_MyDatabase |
|---|
| customers |
| orders |

```sql
SELECT COUNT(*) FROM customers;
-- Expected: 5
SELECT COUNT(*) FROM orders;
-- Expected: 4
```

---

#### Database 2: `salesdb` (Primary Teaching Database)

**Script**: `assets/sql-ultimate-course-main/datasets/mysql/init-mysql-salesdb.sql`

**What it creates**:
- Database `salesdb` with 5 tables: `customers` (5 rows), `employees` (5 rows), `products` (5 rows), `orders` (10 rows), `orders_archive` (10 rows)
- Foreign key constraints between orders → products, orders → customers, orders → employees
- Self-referencing foreign key on employees (`managerid` → `employeeid`)

**How to load**:
1. **File → Open SQL Script** → select the file
2. Execute the entire script
3. Verify:

```sql
USE salesdb;
SHOW TABLES;
```

Expected:

| Tables_in_salesdb |
|---|
| customers |
| employees |
| orders |
| orders_archive |
| products |

```sql
SELECT COUNT(*) FROM customers;    -- Expected: 5
SELECT COUNT(*) FROM employees;    -- Expected: 5
SELECT COUNT(*) FROM products;     -- Expected: 5
SELECT COUNT(*) FROM orders;       -- Expected: 10
SELECT COUNT(*) FROM orders_archive; -- Expected: 10
```

---

#### Database 3: `Parks_and_Recreation` (Beginner-Friendly)

**Script**: `assets/Beginner - Parks_and_Rec_Create_db.sql`

**What it creates**:
- Database `Parks_and_Recreation` with 3 tables: `employee_demographics` (11 rows), `employee_salary` (12 rows), `parks_departments` (6 rows)
- Note: This database intentionally has no foreign key constraints - an imperfect design used for teaching purposes

**How to load**:
1. **File → Open SQL Script** → select the file
2. Execute
3. Verify:

```sql
USE Parks_and_Recreation;
SHOW TABLES;
```

Expected:

| Tables_in_Parks_and_Recreation |
|---|
| employee_demographics |
| employee_salary |
| parks_departments |

```sql
SELECT COUNT(*) FROM employee_demographics;  -- Expected: 11
SELECT COUNT(*) FROM employee_salary;         -- Expected: 12
SELECT COUNT(*) FROM parks_departments;       -- Expected: 6
```

---

#### Database 4: `sql_store` / `sql_hr` / `sql_invoicing` / `sql_inventory` (All-in-One)

**Script**: `assets/sql-course-materials/SQL Course Materials/create-databases.sql`

> This single script creates **4 databases** at once. Run it once and you get all four.

**What it creates**:

| Database | Tables | Row Counts |
|---|---|---|
| `sql_invoicing` | `payment_methods` (4), `clients` (5), `invoices` (17), `payments` (8) | 34 total |
| `sql_store` | `products` (10), `shippers` (5), `customers` (10), `order_statuses` (3), `orders` (10), `order_items` (18), `order_item_notes` (2) | 58 total |
| `sql_hr` | `offices` (10), `employees` (20) | 30 total |
| `sql_inventory` | `products` (10) | 10 total |

**How to load**:
1. **File → Open SQL Script** → select the file
2. Execute the entire script (it switches databases internally with `USE`)
3. Verify each database:

```sql
-- Verify sql_store
USE sql_store;
SHOW TABLES;
SELECT COUNT(*) FROM customers;     -- Expected: 10
SELECT COUNT(*) FROM orders;        -- Expected: 10
SELECT COUNT(*) FROM order_items;   -- Expected: 18

-- Verify sql_hr
USE sql_hr;
SHOW TABLES;
SELECT COUNT(*) FROM offices;       -- Expected: 10
SELECT COUNT(*) FROM employees;     -- Expected: 20

-- Verify sql_invoicing
USE sql_invoicing;
SHOW TABLES;
SELECT COUNT(*) FROM clients;       -- Expected: 5
SELECT COUNT(*) FROM invoices;      -- Expected: 17

-- Verify sql_inventory
USE sql_inventory;
SHOW TABLES;
SELECT COUNT(*) FROM products;      -- Expected: 10
```

---

#### Database 5: `employees` (Large-Scale - 93MB)

**Script**: `assets/employees.sql`

> ⚠️ **This is a large file (93MB).** It may take several minutes to load depending on your hardware. Do not close Workbench while it's running.

**What it creates**:
- Database `employees` with approximately 6 tables: `employees` (~300,000 rows), `departments`, `dept_emp`, `dept_manager`, `salaries` (~2.8 million rows), `titles`
- This is the classic MySQL test database used industry-wide for benchmarking and training

**How to load**:
1. **File → Open SQL Script** → select `employees.sql`
2. MySQL Workbench may warn about the file size - click **OK**
3. Execute. Wait for completion (2–10 minutes depending on hardware)
4. Verify:

```sql
USE employees;
SHOW TABLES;
SELECT COUNT(*) FROM employees;     -- Expected: ~300,024
SELECT COUNT(*) FROM salaries;      -- Expected: ~2,844,047
SELECT COUNT(*) FROM departments;   -- Expected: 9
```

> If the load times out, you can alternatively load it via command line:
> ```
> mysql -u root -p < "C:\path\to\assets\employees.sql"
> ```

---

### 3.2 Loading Databases into PostgreSQL

You need two PostgreSQL databases from the `sql-ultimate-course-main/datasets/postgres/` folder.

#### PostgreSQL Database 1: `mydatabase`

**Script**: `assets/sql-ultimate-course-main/datasets/postgres/init-postgres-mydatabase.sql`

**How to load**:
1. Open **pgAdmin 4**
2. Connect to your local PostgreSQL server
3. Right-click **Databases** → **Create → Database**
4. Name it `mydatabase` → **Save**
5. Right-click `mydatabase` → **Query Tool**
6. Open the SQL script (File → Open) and execute it

Or via command line:
```
psql -U postgres -f "C:\path\to\init-postgres-mydatabase.sql"
```

#### PostgreSQL Database 2: `salesdb`

**Script**: `assets/sql-ultimate-course-main/datasets/postgres/init-postgres-salesdb.sql`

> **Important**: This script creates the database AND a `sales` schema. The PostgreSQL version uses schema-qualified names like `sales.customers` instead of just `customers`.

**How to load**:
1. First, create the database:
   - In pgAdmin: Right-click **Databases** → **Create → Database** → name it `salesdb` → **Save**
2. Connect to `salesdb` (right-click → Query Tool)
3. Execute the script (skip the `DROP DATABASE` / `CREATE DATABASE` lines at the top - you already created it)
4. Verify:

```sql
SELECT COUNT(*) FROM sales.customers;    -- Expected: 5
SELECT COUNT(*) FROM sales.employees;    -- Expected: 5
SELECT COUNT(*) FROM sales.products;     -- Expected: 5
SELECT COUNT(*) FROM sales.orders;       -- Expected: 10
```

---

## 4. Verifying Your Setup

Run this final verification checklist to confirm everything is ready.

### MySQL Verification

Open MySQL Workbench and run:

```sql
-- List all databases
SHOW DATABASES;
```

You should see at least these in the output:

| Database |
|---|
| MyDatabase |
| Parks_and_Recreation |
| salesdb |
| sql_store |
| sql_hr |
| sql_invoicing |
| sql_inventory |
| employees |

### Quick Test - Run a Query Across Databases

```sql
-- Test 1: Simple query on salesdb
USE salesdb;
SELECT firstname, lastname, country FROM customers;

-- Test 2: Simple query on Parks_and_Recreation
USE Parks_and_Recreation;
SELECT first_name, last_name, occupation FROM employee_salary;

-- Test 3: Simple query on sql_store
USE sql_store;
SELECT first_name, last_name, city FROM customers LIMIT 3;
```

If all three queries return data, **your setup is complete**.

### PostgreSQL Verification

Open pgAdmin 4, connect to the PostgreSQL server, and run:

```sql
-- Test: salesdb with schema
SELECT firstname, lastname, country FROM sales.customers;
```

---

## 5. Troubleshooting

### "Access denied for user 'root'@'localhost'"

Your root password is incorrect. Reset it:
1. Stop the MySQL service
2. Start MySQL with `--skip-grant-tables`
3. Connect without a password: `mysql -u root`
4. Run: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';`
5. Restart MySQL normally

### "Can't connect to MySQL server on 'localhost'"

MySQL server is not running. 
- **Windows**: Open Services (`Win+R` → `services.msc`) → Find `MySQL80` → Start
- **macOS**: System Preferences → MySQL → Start Server

### "ERROR 1046 (3D000): No database selected"

You forgot to run `USE database_name;` before your query. Always switch to the correct database first.

### "ERROR 1062: Duplicate entry"

You're trying to load a script that has already been loaded. The script drops and recreates the database, so this shouldn't happen. If it does, run the `DROP DATABASE IF EXISTS` line at the top of the script manually first.

### MySQL Workbench hangs when loading `employees.sql`

The file is 93MB. Workbench has a timeout for large scripts. Use the command line instead:

```
mysql -u root -p < "full_path_to_employees.sql"
```

### pgAdmin won't connect

Make sure the PostgreSQL service is running:
- **Windows**: Services → `postgresql-x64-15` → Start
- **macOS**: `brew services start postgresql@15`

---

## Summary: What You Should Have After Setup

| Component | Status |
|---|---|
| MySQL Server 8.0+ running | ☐ |
| MySQL Workbench connected | ☐ |
| PostgreSQL 15+ running | ☐ |
| pgAdmin 4 connected | ☐ |
| `MyDatabase` loaded (MySQL) | ☐ |
| `salesdb` loaded (MySQL) | ☐ |
| `Parks_and_Recreation` loaded (MySQL) | ☐ |
| `sql_store` loaded (MySQL) | ☐ |
| `sql_hr` loaded (MySQL) | ☐ |
| `sql_invoicing` loaded (MySQL) | ☐ |
| `sql_inventory` loaded (MySQL) | ☐ |
| `employees` loaded (MySQL) | ☐ |
| `salesdb` loaded (PostgreSQL) | ☐ |
| `mydatabase` loaded (PostgreSQL) | ☐ |

Once all boxes are checked, proceed to **Chapter 1 - Introduction**.
