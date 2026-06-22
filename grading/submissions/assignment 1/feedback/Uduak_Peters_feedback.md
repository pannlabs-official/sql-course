# Feedback for Uduak Peters

## Grade: 75/100

### What You Did Well
- You grasped the fundamentals of the `USE` statement and how to switch between databases.
- You accurately extracted specific columns like `first_name` and `score` from tables.
- Good use of comments to organize your code!

### Areas for Improvement
- In Exercise 1.9, you wrote:
  ```sql
  select customer from mydatabase;
  ```
  This is incorrect syntax. `mydatabase` is a database, not a table. You must `SELECT` from a table. The correct way is:
  ```sql
  SELECT * FROM mydatabase.customers;
  ```
- You didn't find the highest sales amount for Exercise 1.8.

Keep practicing, you're off to a good start!
