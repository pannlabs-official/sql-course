-- Exercise 1.1: List all databases on the MySQL server
SHOW DATABASES;

-- Exercise 1.2: Switch to MyDatabase and display all tables
USE MyDatabase;

-- Exercise 1.3: Retrieve all columns from the customers table
SHOW TABLES;
SELECT * FROM customers;

-- Exercise 1.4: Retrieve only the first_name and score columns from customers
SELECT first_name, score FROM customers;

-- Exercise 1.5: Switch to Parks_and_Recreation and retrieve all data from employee_demographics
USE Parks_and_Recreation;
SELECT * FROM employee_demographics;

-- Exercise 1.6: Retrieve the first_name, last_name, and salary from employee_salary
SELECT first_name, last_name, salary FROM employee_salary;

-- Exercise 1.7: Retrieve all data from parks_departments
SELECT * FROM parks_departments;

-- Exercise 1.7 (Part B): Count the total number of departments
SELECT COUNT(*) AS total_departments FROM parks_departments;

-- Exercise 1.8: Retrieve customer_id and sales from the orders table
USE MyDatabase;

SELECT customer_id, sales FROM orders;

-- Exercise 1.8 (Part B): Find the highest sale amount
SELECT MAX(sales) AS highest_sale FROM orders;


-- Exercise 1.9: Retrieve all customers from MyDatabase
SELECT * FROM MyDatabase.customers;

-- Exercise 1.9 (Part B): Retrieve all employee demographics from Parks_and_Recreation
SELECT * FROM Parks_and_Recreation.employee_demographics;
