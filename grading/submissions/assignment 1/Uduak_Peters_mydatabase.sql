-- list all databases--
SHOW databases;
-- choose a database --
USE mydatabase;
-- show available tables --
show tables;
-- retrieve columns from customers table --
select *
from customers;
-- retrieve first_name and score column --
select 
first_name,
score
from customers;
-- switch database and retrieve employee_demographic table --
USE parks_and_recreation;
-- retrieve all data fro employee_salary--
select *
from employee_salary;
-- retrieve first_name,last_name and score from employee_salary --
select 
first_name,
last_name,
salary
from employee_salary;
-- Retrieve all data from Parks_and_Recreation.parks_departments. How many departments are there? --
select *
from parks_departments;
-- Exercise 1.8: In MyDatabase, retrieve only the customer_id and sales columns from the orders table. What is the highest sale amount? --
USE mydatabase;
select *
from orders;
-- retrieve only customer_id and sales column from order table --
select 
customer_id,
sales
from orders;
-- retrieve all customers from mydatabase --
select 
customer
from mydatabase; 