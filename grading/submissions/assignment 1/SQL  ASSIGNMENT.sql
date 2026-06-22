-- list all database on this MySQL Server
SHOW DATABASES;

-- Switch to MyDatabase and display all tables
USE MyDatabase;
SHOW TABLES;

-- retrieve all columns from the customers table
SELECT *
FROM customers;

-- retrieve only the first_name and score columns from customers
SELECT first_name, score
FROM customers;

-- Switch to Parks_and_Recreation and retrieve all data from the employee_demographics table
USE Parks_and_Recreation;
SELECT *
FROM employee_demographics;

-- retrieve the first_name, last_name, and salary from employee_salary
SELECT first_name,
 last_name,
 salary
FROM employee_salary;

-- Retrieve all data from Parks_and_Recreation.parks_departments. How many departments are there?
SELECT *
FROM parks_departments;

SELECT COUNT(*) AS total_departments
FROM parks_departments;

-- 
USE MyDatabase;

SELECT customer_id, sales
FROM orders;

SELECT MAX(sales) AS highest_sale
FROM orders;

-- Exercise 1.9
SELECT *
FROM customers;

USE Parks_and_Recreation;

SELECT *
FROM employee_demographics;


-- Exercise 1.10: Without running it, predict whether this query will work. Then test your prediction:

USE MyDatabase;
SELECT first_name, score * 10 AS big_score
FROM customers
ORDER BY big_score;

-- Exercise 1.11
/* Customer 6's order is an example of a referential integrity problem (an orphan record)
The correct way to prevent it is by enforcing a foreign key relationship between the orders and customers tables
*\
