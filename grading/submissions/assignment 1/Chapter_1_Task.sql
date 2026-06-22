-- List all databases on this MySQL server
SHOW DATABASES;

-- Switch to mydatabase
USE mydatabase;

-- List all tables in the current database
SHOW TABLES;

-- Retrieve all columns and all rows from the customers table
SELECT * FROM customers;

-- Retrieve only the name and score columns
SELECT 
    first_name, 
    score 
FROM customers;

-- Retrieve all order data
SELECT * FROM orders;

-- Switch to the Parks and Recreation database
USE parks_and_recreation;

-- See what tables are available
SHOW TABLES;

-- Retrieve first_name, last_name & salary from employee_salary
SELECT 
    first_name, 
    last_name,
    salary
FROM parks_and_recreation.employee_salary;

-- Retrieve departments in parks_and_recreation
SELECT * FROM parks_and_recreation.parks_departments;

USE mydatabase;
SHOW TABLES;

SELECT
	customer_id,
    sales
FROM mydatabase.orders;

USE mydatabase;
SELECT * FROM parks_and_recreation.employee_demographics;

USE mydatabase;
SELECT first_name, score * 10 AS big_score
FROM customers
ORDER BY big_score;

