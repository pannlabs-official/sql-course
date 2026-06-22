# Feedback for mydatabase / park_and_recreation assignment

## Grade: 50/100

### What You Did Well
- You understand how to `USE` a database and do a basic `SELECT *` query to get all data.
- You properly tested the order execution puzzle.

### Areas for Improvement
- **Syntax Errors**: In your `mydatabase assignment.sql` file, you wrote:
  ```sql
  select * from orders
  customer_id,
  sales
  orders;
  ```
  This is not valid SQL. To retrieve specific columns, you must list them right after the `SELECT` keyword, like this:
  ```sql
  SELECT customer_id, sales FROM orders;
  ```
- **Table Names**: In the `park_and_recreation` file, you queried `department` and `parks_department`. The actual table name is `parks_departments` (with an 's' at the end). Always use `SHOW TABLES;` to verify exact table names.

Review the syntax rules section of Chapter 1 and try rewriting those broken queries!
