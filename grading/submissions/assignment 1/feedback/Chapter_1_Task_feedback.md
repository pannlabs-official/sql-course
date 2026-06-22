# Feedback for Chapter_1_Task

## Grade: 90/100

### What You Did Well
- You successfully connected to both `mydatabase` and `parks_and_recreation` and retrieved data using `SELECT` statements.
- Excellent use of fully qualified table names (e.g., `parks_and_recreation.employee_salary`)!
- You successfully executed the final order puzzle.

### Areas for Improvement
- **Exercise 1.8**: You retrieved the `customer_id` and `sales`, but you didn't answer the second part of the question: "What is the highest sale amount?". Always make sure to answer all parts of the exercise prompt.
- **Exercise 1.7**: You retrieved the departments, but didn't explicitly answer how many there were.

### Corrected Code Example
To find the highest sale amount manually based on Chapter 1:
```sql
SELECT customer_id, sales 
FROM mydatabase.orders 
ORDER BY sales DESC 
LIMIT 1;
```

Keep up the good work!
