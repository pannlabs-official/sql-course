# Chapter 7 - Row-Level Functions

---

## Chapter Overview

Row-level functions (also called scalar functions) transform individual values. Given one row, they return one value. Unlike aggregate functions (Chapter 8) which operate on groups of rows, row-level functions operate on each row independently.

This chapter covers five categories of functions: string, numeric, date/time, NULL-handling, and conditional logic (CASE). These functions are your primary tools for cleaning, transforming, and preparing data for analysis.

### Prerequisites

- Completed Chapters 1–6
- `salesdb`, `sql_store`, and `sql_invoicing` loaded

### Reference Scripts

This chapter draws heavily from 6 reference scripts:
- `07_String_Functions.sql`
- `08_Number_Functions.sql`
- `09_Date_Time_Functions.sql`
- `10_Date_Time_Formats.sql`
- `11_NULL_Functions.sql`
- `12_Case_Statements.sql`

```sql
USE salesdb;
```

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. Transform text with string functions (CONCAT, SUBSTRING, TRIM, REPLACE, UPPER/LOWER, etc.)
2. Perform numeric operations with ROUND, CEIL, FLOOR, MOD, ABS, TRUNCATE
3. Work with dates using extraction, formatting, and arithmetic functions
4. Handle NULLs defensively with IFNULL, COALESCE, and NULLIF
5. Build conditional logic with IF() and CASE WHEN
6. Identify key MySQL vs PostgreSQL function differences

---

## 7.1 String Functions

### 7.1.1 CONCAT - Combining Strings

```sql
-- Combine first and last name
SELECT 
    CONCAT(firstname, ' ', lastname) AS full_name
FROM customers;
```

| full_name |
|---|
| Jossef Goldberg |
| Kevin Brown |
| NULL |
| Mark Schwarz |
| Anna Adams |

> Recall from Chapter 2: CONCAT returns NULL if any argument is NULL (Mary's lastname is NULL). We will fix this with COALESCE in Section 7.4.

**CONCAT_WS** - Concat With Separator (skips NULLs):

```sql
SELECT CONCAT_WS(' ', firstname, lastname) AS full_name
FROM customers;
```

| full_name |
|---|
| Jossef Goldberg |
| Kevin Brown |
| Mary |
| Mark Schwarz |
| Anna Adams |

`CONCAT_WS` ignores NULL values instead of propagating them. Mary's name now appears as just "Mary".

### 7.1.2 UPPER / LOWER - Case Conversion

```sql
SELECT 
    UPPER(firstname) AS upper_name,
    LOWER(country) AS lower_country
FROM customers;
```

| upper_name | lower_country |
|---|---|
| JOSSEF | germany |
| KEVIN | usa |
| MARY | usa |
| MARK | germany |
| ANNA | usa |

### 7.1.3 LENGTH / CHAR_LENGTH

```sql
SELECT 
    firstname,
    LENGTH(firstname) AS byte_length,
    CHAR_LENGTH(firstname) AS char_length
FROM customers;
```

| firstname | byte_length | char_length |
|---|---|---|
| Jossef | 6 | 6 |
| Kevin | 5 | 5 |
| Mary | 4 | 4 |
| Mark | 4 | 4 |
| Anna | 4 | 4 |

> **LENGTH vs CHAR_LENGTH**: `LENGTH` returns bytes; `CHAR_LENGTH` returns characters. For ASCII text they are the same. For multi-byte characters (emojis, accented characters): `LENGTH('é')` = 2 bytes, `CHAR_LENGTH('é')` = 1 character. Use `CHAR_LENGTH` when you care about character count.

### 7.1.4 SUBSTRING - Extracting Parts of a String

```sql
-- Extract the first 3 characters of each product name
SELECT 
    product,
    SUBSTRING(product, 1, 3) AS short_code
FROM products;
```

| product | short_code |
|---|---|
| Bottle | Bot |
| Tire | Tir |
| Socks | Soc |
| Caps | Cap |
| Gloves | Glo |

Syntax: `SUBSTRING(string, start_position, length)` - positions are 1-based.

### 7.1.5 LEFT / RIGHT - Extract from Ends

```sql
SELECT 
    product,
    LEFT(product, 3) AS first_three,
    RIGHT(product, 2) AS last_two
FROM products;
```

| product | first_three | last_two |
|---|---|---|
| Bottle | Bot | le |
| Tire | Tir | re |
| Socks | Soc | ks |

### 7.1.6 TRIM - Removing Whitespace

```sql
-- Remove leading and trailing spaces
SELECT 
    TRIM('   Hello World   ') AS trimmed,
    LTRIM('   Hello') AS left_trimmed,
    RTRIM('Hello   ') AS right_trimmed;
```

| trimmed | left_trimmed | right_trimmed |
|---|---|---|
| Hello World | Hello | Hello |

> **Real-world use**: Remember " John" from `MyDatabase.customers`? `TRIM(first_name)` would fix that leading space.

### 7.1.7 REPLACE - Substituting Text

```sql
-- Replace 'USA' with 'United States'
SELECT 
    country,
    REPLACE(country, 'USA', 'United States') AS full_country
FROM customers;
```

| country | full_country |
|---|---|
| Germany | Germany |
| USA | United States |
| USA | United States |
| Germany | Germany |
| USA | United States |

### 7.1.8 REVERSE

```sql
SELECT 
    firstname,
    REVERSE(firstname) AS reversed
FROM customers;
```

| firstname | reversed |
|---|---|
| Jossef | fessoJ |
| Kevin | niveK |

### 7.1.9 LPAD / RPAD - Padding

```sql
-- Pad product IDs to 5 digits with leading zeros
SELECT 
    productid,
    LPAD(productid, 5, '0') AS padded_id
FROM products;
```

| productid | padded_id |
|---|---|
| 101 | 00101 |
| 102 | 00102 |
| 103 | 00103 |

### 7.1.10 LOCATE - Finding Position

```sql
-- Find the position of 'o' in each product name
SELECT 
    product,
    LOCATE('o', product) AS position_of_o
FROM products;
```

| product | position_of_o |
|---|---|
| Bottle | 2 |
| Tire | 0 |
| Socks | 2 |
| Caps | 0 |
| Gloves | 3 |

Returns 0 if not found (unlike most programming languages which return -1).

---

## 7.2 Numeric Functions

### 7.2.1 ROUND - Rounding

```sql
SELECT 
    ROUND(3.14159, 2) AS two_decimals,   -- 3.14
    ROUND(3.14159, 0) AS no_decimals,     -- 3
    ROUND(3.5) AS half_up,                -- 4
    ROUND(4.5) AS bankers_rounding;       -- 4 (MySQL uses "round half to even")
```

| two_decimals | no_decimals | half_up | bankers_rounding |
|---|---|---|---|
| 3.14 | 3 | 4 | 4 |

> **Banker's rounding**: When the value is exactly halfway (e.g., 4.5), MySQL rounds to the nearest even number (4, not 5). This reduces bias in large datasets.

### 7.2.2 CEIL / FLOOR - Rounding Up and Down

```sql
SELECT 
    CEIL(3.1) AS ceiling,     -- 4 (always rounds up)
    FLOOR(3.9) AS floor_val;  -- 3 (always rounds down)
```

### 7.2.3 TRUNCATE - Cut Off Decimals

Unlike ROUND, TRUNCATE simply removes digits without rounding:

```sql
SELECT 
    TRUNCATE(3.14159, 2) AS truncated,   -- 3.14 (not 3.14)
    ROUND(3.14159, 2) AS rounded;         -- 3.14 (same here, but differs for 3.145)
```

```sql
SELECT 
    TRUNCATE(3.149, 2) AS truncated,  -- 3.14
    ROUND(3.149, 2) AS rounded;        -- 3.15  ← Different!
```

### 7.2.4 ABS - Absolute Value

```sql
SELECT ABS(-42) AS absolute_value;  -- 42
```

### 7.2.5 MOD - Modulo (Remainder)

```sql
-- Find even/odd employee IDs
SELECT 
    employeeid,
    firstname,
    MOD(employeeid, 2) AS is_odd
FROM employees;
```

| employeeid | firstname | is_odd |
|---|---|---|
| 1 | Frank | 1 |
| 2 | Kevin | 0 |
| 3 | Mary | 1 |
| 4 | Michael | 0 |
| 5 | Carol | 1 |

### 7.2.6 POWER - Exponentiation

```sql
SELECT POWER(2, 10) AS two_to_the_ten;  -- 1024
```

---

## 7.3 Date and Time Functions

### 7.3.1 Current Date/Time Functions

```sql
SELECT 
    NOW() AS current_datetime,            -- 2026-06-11 08:30:45
    CURDATE() AS current_date_only,       -- 2026-06-11
    CURTIME() AS current_time_only,       -- 08:30:45
    CURRENT_TIMESTAMP AS ts;              -- same as NOW()
```

### 7.3.2 Extracting Date Parts

```sql
SELECT 
    orderdate,
    YEAR(orderdate) AS year,
    MONTH(orderdate) AS month,
    DAY(orderdate) AS day,
    DAYNAME(orderdate) AS day_name,
    MONTHNAME(orderdate) AS month_name,
    DAYOFWEEK(orderdate) AS dow,
    QUARTER(orderdate) AS quarter
FROM orders;
```

| orderdate | year | month | day | day_name | month_name | dow | quarter |
|---|---|---|---|---|---|---|---|
| 2025-01-01 | 2025 | 1 | 1 | Wednesday | January | 4 | 1 |
| 2025-01-05 | 2025 | 1 | 5 | Sunday | January | 1 | 1 |
| ... | ... | ... | ... | ... | ... | ... | ... |

`EXTRACT()` - The SQL standard approach:

```sql
SELECT 
    EXTRACT(YEAR FROM orderdate) AS year,
    EXTRACT(MONTH FROM orderdate) AS month
FROM orders;
```

### 7.3.3 Date Arithmetic

```sql
-- Add/subtract days
SELECT 
    orderdate,
    DATE_ADD(orderdate, INTERVAL 30 DAY) AS plus_30_days,
    DATE_SUB(orderdate, INTERVAL 1 MONTH) AS minus_1_month,
    orderdate + INTERVAL 7 DAY AS plus_7_shorthand
FROM orders
LIMIT 3;
```

| orderdate | plus_30_days | minus_1_month | plus_7_shorthand |
|---|---|---|---|
| 2025-01-01 | 2025-01-31 | 2024-12-01 | 2025-01-08 |
| 2025-01-05 | 2025-02-04 | 2024-12-05 | 2025-01-12 |
| 2025-01-10 | 2025-02-09 | 2024-12-10 | 2025-01-17 |

**DATEDIFF** - Days between two dates:

```sql
SELECT 
    orderid,
    orderdate,
    shipdate,
    DATEDIFF(shipdate, orderdate) AS days_to_ship
FROM orders;
```

| orderid | orderdate | shipdate | days_to_ship |
|---|---|---|---|
| 1 | 2025-01-01 | 2025-01-05 | 4 |
| 2 | 2025-01-05 | 2025-01-10 | 5 |
| 3 | 2025-01-10 | 2025-01-25 | 15 |
| ... | ... | ... | ... |

> **PostgreSQL difference**: PostgreSQL uses `AGE()` and interval arithmetic:
> ```sql
> SELECT shipdate - orderdate AS days_to_ship FROM sales.orders;
> ```

### 7.3.4 DATE_FORMAT - Formatting Output

```sql
SELECT 
    orderdate,
    DATE_FORMAT(orderdate, '%d/%m/%Y') AS uk_format,
    DATE_FORMAT(orderdate, '%M %d, %Y') AS us_format,
    DATE_FORMAT(orderdate, '%W') AS day_of_week
FROM orders
LIMIT 3;
```

| orderdate | uk_format | us_format | day_of_week |
|---|---|---|---|
| 2025-01-01 | 01/01/2025 | January 01, 2025 | Wednesday |
| 2025-01-05 | 05/01/2025 | January 05, 2025 | Sunday |
| 2025-01-10 | 10/01/2025 | January 10, 2025 | Friday |

**Common format specifiers**:

| Specifier | Meaning | Example |
|---|---|---|
| `%Y` | 4-digit year | 2025 |
| `%y` | 2-digit year | 25 |
| `%M` | Full month name | January |
| `%m` | Month number (01–12) | 01 |
| `%d` | Day of month (01–31) | 05 |
| `%D` | Day with suffix | 5th |
| `%W` | Full weekday name | Wednesday |
| `%H` | Hour (00–23) | 14 |
| `%i` | Minutes (00–59) | 30 |
| `%s` | Seconds (00–59) | 45 |
| `%p` | AM/PM | PM |

> **PostgreSQL equivalent**: Use `TO_CHAR()`:
> ```sql
> SELECT TO_CHAR(orderdate, 'DD/MM/YYYY') AS uk_format FROM sales.orders;
> ```

---

## 7.4 NULL-Handling Functions

### 7.4.1 IFNULL - Replace NULL with a Default

```sql
-- Replace NULL scores with 0
SELECT 
    firstname,
    score,
    IFNULL(score, 0) AS score_safe
FROM customers;
```

| firstname | score | score_safe |
|---|---|---|
| Jossef | 350 | 350 |
| Kevin | 900 | 900 |
| Mary | 750 | 750 |
| Mark | 500 | 500 |
| Anna | NULL | 0 |

### 7.4.2 COALESCE - First Non-NULL Value

`COALESCE` accepts multiple arguments and returns the first one that is not NULL:

```sql
-- Use shipaddress if available, otherwise billaddress, otherwise 'No Address'
SELECT 
    orderid,
    shipaddress,
    billaddress,
    COALESCE(shipaddress, billaddress, 'No Address') AS effective_address
FROM orders;
```

| orderid | shipaddress | billaddress | effective_address |
|---|---|---|---|
| 1 | 9833 Mt. Dias Blv. | 1226 Shoe St. | 9833 Mt. Dias Blv. |
| 5 | NULL | NULL | No Address |
| ... | ... | ... | ... |

> **COALESCE is SQL standard** and works identically in MySQL and PostgreSQL. `IFNULL` is MySQL-specific. Prefer COALESCE for portability.

### 7.4.3 Fixing the CONCAT NULL Problem

Now we can fix the full name issue from earlier:

```sql
SELECT 
    CONCAT(firstname, ' ', COALESCE(lastname, '')) AS full_name
FROM customers;
```

| full_name |
|---|
| Jossef Goldberg |
| Kevin Brown |
| Mary |
| Mark Schwarz |
| Anna Adams |

### 7.4.4 NULLIF - Return NULL If Values Are Equal

```sql
-- NULLIF(a, b) returns NULL if a = b, otherwise returns a
SELECT NULLIF(10, 10) AS result1,    -- NULL (because 10 = 10)
       NULLIF(10, 20) AS result2;    -- 10 (because 10 ≠ 20)
```

**Practical use**: Preventing division by zero:

```sql
-- Without NULLIF: division by zero error
SELECT 100 / 0;  -- Error in some engines, returns NULL in MySQL

-- With NULLIF: safely returns NULL
SELECT 100 / NULLIF(quantity, 0) AS price_per_unit
FROM orders;
```

---

## 7.5 Conditional Logic - CASE and IF

### 7.5.1 IF() - MySQL Inline Conditional

```sql
-- Classify orders as 'High' or 'Low' based on sales
SELECT 
    orderid,
    sales,
    IF(sales >= 50, 'High', 'Low') AS sales_tier
FROM orders;
```

| orderid | sales | sales_tier |
|---|---|---|
| 1 | 10 | Low |
| 4 | 60 | High |
| 8 | 90 | High |
| ... | ... | ... |

> `IF()` is MySQL-specific. For portability, use `CASE`.

### 7.5.2 Simple CASE - Matching Values

```sql
-- Convert order status to a descriptive label
SELECT 
    orderid,
    orderstatus,
    CASE orderstatus
        WHEN 'Shipped' THEN 'In Transit'
        WHEN 'Delivered' THEN 'Completed'
        ELSE 'Unknown'
    END AS status_label
FROM orders;
```

| orderid | orderstatus | status_label |
|---|---|---|
| 1 | Delivered | Completed |
| 2 | Shipped | In Transit |
| ... | ... | ... |

### 7.5.3 Searched CASE - Multiple Conditions

```sql
-- Classify employees by salary range
SELECT 
    firstname,
    salary,
    CASE
        WHEN salary >= 80000 THEN 'Senior'
        WHEN salary >= 60000 THEN 'Mid-Level'
        WHEN salary >= 40000 THEN 'Junior'
        ELSE 'Entry'
    END AS salary_band
FROM employees;
```

| firstname | salary | salary_band |
|---|---|---|
| Frank | 55000 | Junior |
| Kevin | 65000 | Mid-Level |
| Mary | 75000 | Mid-Level |
| Michael | 90000 | Senior |
| Carol | 55000 | Junior |

> **Execution note**: CASE evaluates conditions top to bottom and stops at the **first** match. If Michael's salary is 90000, it matches `>= 80000` first and never checks the other conditions.

### 7.5.4 CASE with Aggregation - Pivoting Data

CASE inside aggregate functions is a powerful technique for creating pivot-like reports:

```sql
-- Count orders by status using CASE
SELECT 
    COUNT(CASE WHEN orderstatus = 'Delivered' THEN 1 END) AS delivered,
    COUNT(CASE WHEN orderstatus = 'Shipped' THEN 1 END) AS shipped
FROM orders;
```

| delivered | shipped |
|---|---|
| 4 | 6 |

This transforms row values into columns - a common reporting pattern.

### 7.5.5 Nested CASE

```sql
-- Complex classification
SELECT 
    firstname,
    country,
    score,
    CASE
        WHEN country = 'USA' THEN
            CASE
                WHEN score >= 800 THEN 'USA Premium'
                WHEN score >= 500 THEN 'USA Standard'
                ELSE 'USA Basic'
            END
        WHEN country = 'Germany' THEN
            CASE
                WHEN score >= 400 THEN 'DE Premium'
                ELSE 'DE Standard'
            END
        ELSE 'Other'
    END AS customer_tier
FROM customers;
```

| firstname | country | score | customer_tier |
|---|---|---|---|
| Jossef | Germany | 350 | DE Standard |
| Kevin | USA | 900 | USA Premium |
| Mary | USA | 750 | USA Standard |
| Mark | Germany | 500 | DE Premium |
| Anna | USA | NULL | USA Basic |

---

## 7.6 MySQL vs PostgreSQL Function Reference

| Function Category | MySQL | PostgreSQL |
|---|---|---|
| String concatenation | `CONCAT(a, b)` | `a \|\| b` or `CONCAT(a, b)` |
| String length | `LENGTH()`, `CHAR_LENGTH()` | `LENGTH()`, `CHAR_LENGTH()` |
| Case conversion | `UPPER()`, `LOWER()` | `UPPER()`, `LOWER()` |
| Substring | `SUBSTRING(s, pos, len)` | `SUBSTRING(s FROM pos FOR len)` |
| Trim | `TRIM()`, `LTRIM()`, `RTRIM()` | `TRIM()`, `LTRIM()`, `RTRIM()` |
| Replace | `REPLACE()` | `REPLACE()` |
| Date formatting | `DATE_FORMAT(date, '%Y-%m-%d')` | `TO_CHAR(date, 'YYYY-MM-DD')` |
| Date extraction | `YEAR()`, `MONTH()`, `DAY()` | `EXTRACT(YEAR FROM date)` |
| Date difference | `DATEDIFF(d1, d2)` | `d1 - d2` (returns integer days) |
| Date add | `DATE_ADD(d, INTERVAL n DAY)` | `d + INTERVAL 'n days'` |
| NULL handling | `IFNULL(val, default)` | Use `COALESCE(val, default)` |
| Conditional | `IF(cond, true, false)` | Use `CASE WHEN cond THEN true ELSE false END` |
| Rounding | `ROUND()`, `TRUNCATE()` | `ROUND()`, `TRUNC()` |

---

## Common Mistakes & Misconceptions

### Mistake 1: CONCAT with NULL

```sql
-- ❌ Returns NULL (not 'Mary ')
SELECT CONCAT('Mary', ' ', NULL);

-- ✅ Fix: Use COALESCE or CONCAT_WS
SELECT CONCAT('Mary', ' ', COALESCE(NULL, ''));
SELECT CONCAT_WS(' ', 'Mary', NULL);  -- Returns 'Mary'
```

### Mistake 2: Wrong DATEDIFF Argument Order

```sql
-- MySQL: DATEDIFF(end, start)
SELECT DATEDIFF('2025-03-15', '2025-01-01');  -- 73 (positive)
SELECT DATEDIFF('2025-01-01', '2025-03-15');  -- -73 (negative - wrong order)
```

### Mistake 3: Forgetting CASE ... END

```sql
-- ❌ Missing END
SELECT CASE WHEN score > 500 THEN 'High' ELSE 'Low' FROM customers;
-- ERROR 1064: Syntax error

-- ✅ Always close with END
SELECT CASE WHEN score > 500 THEN 'High' ELSE 'Low' END FROM customers;
```

### Mistake 4: Using ROUND When You Mean TRUNCATE

```sql
ROUND(9.99, 1)    -- 10.0 (rounds up)
TRUNCATE(9.99, 1) -- 9.9  (cuts off)
```

---

## Practice Exercises

### Beginner

**Exercise 7.1**: Create a full name column for all customers using `CONCAT_WS` that handles NULLs gracefully.

**Exercise 7.2**: Display all products with their names in uppercase and their prices rounded to the nearest whole number.

**Exercise 7.3**: For each order, calculate the number of days between `orderdate` and `shipdate`.

**Exercise 7.4**: Replace all NULL scores in the customers table display with the text 'No Score' using COALESCE.

### Intermediate

**Exercise 7.5**: Using `sql_invoicing`, format all invoice dates as 'DD Mon YYYY' (e.g., '09 Mar 2019') using DATE_FORMAT.

**Exercise 7.6**: Create a `salary_category` column for employees: 'Above Average' if their salary exceeds the average salary, 'Below Average' otherwise. (Hint: use a subquery for the average.)

**Exercise 7.7**: Extract the year and month from `orderdate` and create a column `order_month` in the format 'YYYY-MM'. Group by this column to show total sales per month.

**Exercise 7.8**: For each order, show the `shipaddress` trimmed of whitespace, and if it is NULL, display the `billaddress` instead, and if both are NULL, display 'Not Available'.

### Challenge

**Exercise 7.9**: Create a comprehensive customer report using CASE:
- Score 800+: 'Platinum'
- Score 500-799: 'Gold'
- Score 200-499: 'Silver'
- Score below 200: 'Bronze'
- NULL score: 'Unrated'

**Exercise 7.10**: Using `sql_invoicing`, calculate the age of each invoice in days (from `invoice_date` to today). Classify them as 'Current' (< 30 days), 'Overdue' (30-90 days), or 'Severely Overdue' (> 90 days).

---

## Key Takeaways

1. **String functions clean and transform text.** `CONCAT_WS` is NULL-safe. `TRIM` removes whitespace. `REPLACE` substitutes patterns. `UPPER/LOWER` standardises case.

2. **Numeric functions perform mathematical operations.** `ROUND` rounds to precision. `TRUNCATE` cuts digits. `MOD` finds remainders. Use `ROUND` for display, `TRUNCATE` for financial calculations.

3. **Date functions extract, format, and calculate.** `YEAR()`, `MONTH()`, `DAY()` for extraction. `DATE_FORMAT()` for display. `DATEDIFF()` and `DATE_ADD()` for arithmetic.

4. **COALESCE is the universal NULL handler.** It returns the first non-NULL value from a list. Prefer it over `IFNULL` for portability.

5. **CASE is the SQL if/else.** Simple CASE matches values; Searched CASE evaluates conditions. CASE inside aggregates creates pivot reports.

6. **MySQL and PostgreSQL differ on date formatting** (`DATE_FORMAT` vs `TO_CHAR`), **NULL handling** (`IFNULL` vs `COALESCE`), and **string concatenation** (`CONCAT` vs `||`).

---

## PostgreSQL Assignment

**PG-7.1**: Concatenate `firstname` and `lastname` from `sales.customers` using the `||` operator instead of `CONCAT`.

**PG-7.2**: Format `orderdate` from `sales.orders` using PostgreSQL's `TO_CHAR(orderdate, 'DD Mon YYYY')`.

**PG-7.3**: Use PostgreSQL's `AGE()` function to calculate how old each order is: `AGE(NOW(), orderdate)`.

---

## Next Chapter

→ **Chapter 8 - Aggregation & Analytical Functions**: Row-level functions transform individual values. Aggregation and window functions transform entire groups - totals, averages, rankings, running sums, and comparisons across rows.
