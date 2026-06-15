# The Complete SQL Course: From Zero to Production

![Course Cover](./images/course_hero.png)

A comprehensive, interactive, Single Page Application (SPA) SQL course designed for data analysts and backend engineers. This course takes you from fundamental querying to advanced analytics and performance optimization, all within a beautiful, modern web interface.

## 🚀 Live Demo

**[View the Live Course Here](https://sql-course-plum.vercel.app/)**

## 📖 Course Overview

This repository contains the full curriculum, datasets, and the SPA codebase for the Complete SQL Course. 

### Core Modules:
1. **Introduction to Databases & SQL**: Setup, architecture, and basic commands.
2. **Querying Data (SELECT)**: Mastering the fundamental verb of data retrieval.
3. **Data Definition (DDL)**: Designing schemas, tables, and constraints.
4. **Data Manipulation (DML)**: Safely inserting, updating, and deleting records.
5. **Filtering Data**: Precision data extraction using WHERE, wildcards, and logic.
6. **Combining Data**: JOINs, UNIONs, and relational algebra.
7. **Row-Level Functions**: String manipulation, date processing, and CASE statements.
8. **Aggregation & Analytical Functions**: GROUP BY, Window Functions, and business intelligence.
9. **Advanced Techniques**: CTEs, Subqueries, Views, and Triggers.
10. **Performance Optimization**: Indexes, Query Plans, and execution strategies.
11. **AI & SQL**: Leveraging modern LLMs for query generation and optimization.
12. **Capstone Projects**: Real-world data analysis challenges.

## 🛠️ Tech Stack & Features

- **Frontend**: Vanilla HTML/CSS/JavaScript (Zero dependency SPA)
- **Content**: Markdown-driven chapters parsed dynamically via `marked.js`
- **Features**: 
  - Dynamic Table of Contents routing
  - Persistent Light/Dark Mode toggle
  - Smart Scroll Navigation
  - Responsive, mobile-friendly design
- **Deployment**: Vercel

## 💻 Local Development

To run or modify the course locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pannlabs-official/sql-course.git
   cd sql-course
   ```

2. **View the Course**:
   Simply open `sql-course.html` in your favorite web browser. No local server required!

3. **Rebuild Content** (Optional):
   If you modify any of the Markdown (`.md`) files in the root directory, you can update the `sql-course.html` file by running the build script via Node.js:
   ```bash
   npm run build
   # or
   node build-course.js
   ```

## 🗄️ Datasets

The `/datasets` folder contains the SQL dumps and CSVs used throughout the course assignments. 

*Note: Heavy `.bak` and raw database dumps are ignored via `.gitignore` to keep the repository lightweight and deployment-friendly.*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
