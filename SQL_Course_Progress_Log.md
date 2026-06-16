# SQL Course - Conversation Log & Progress

## Overview
This file serves as a persistent log of the major actions, features, and deployments completed for the **Complete SQL Course (From Zero to Production)**. This ensures we don't lose track of our progress across different chat sessions.

---

## 1. Project Architecture
* **Single Page Application (SPA)**: Built a custom static site generator (`build-course.js`) that injects Markdown chapters into a single `index.html` file.
* **Tech Stack**: HTML, Vanilla CSS, JS (`marked.js` for Markdown parsing).
* **Key Features**:
  * Seamless client-side routing (no page reloads).
  * Dynamic Dark/Light mode toggle (persists via CSS variables).
  * Smart "Scroll Down / Scroll Up" button.
  * Auto-generated Table of Contents.

## 2. Curriculum & Content
* **Full 12-Chapter Curriculum Written**:
  * `00-course-overview.md` & `00-database-setup-guide.md`
  * `01-introduction.md` (Includes the 10-Table Data Maze assignment)
  * `02-querying-data-select.md` (SELECT, LIMIT, GROUP BY, execution order)
  * `03-data-definition-ddl.md` (Constraints, Primary/Foreign keys, Data types)
  * `04-data-manipulation-dml.md` (INSERT, UPDATE, DELETE)
  * `05-filtering-data.md` (WHERE, AND/OR, LIKE, IN, REGEXP, NULL logic)
  * `06-combining-data.md` (JOINs, UNION)
  * `07-row-level-functions.md` (String, Date, Math functions)
  * `08-aggregation-analytical-functions.md` (Window functions, CTEs)
  * `09-advanced-sql-techniques.md`
  * `10-performance-optimization.md` (Indexes, Execution plans)
  * `11-ai-and-sql.md`
  * `12-sql-projects.md`

## 3. UI/UX Polishing
* **Em-Dashes Removed**: Hunted down all em-dashes (`—`) across all 14 markdown files and the JS builder, replacing them with standard hyphens (`-`).
* **Branding & Logo**: 
  * Extracted user's custom logo from the `Downloads` folder into `images/logo.png`.
  * Injected the logo into the site's `<head>` as a favicon.
  * Added the logo to the top-left corner of the UI (`.brand-logo`) with a fixed position, scaling it up to `70px` height for better visibility.
  * Clicking the brand logo navigates back to the Home page.

## 4. Deployment Pipeline
* **GitHub Repository**: Pushed all changes to `pannlabs-official/sql-course`.
* **Vercel Integration**: Configured `vercel.json` for proper routing. 
* **Live Site**: Automatically deploys on every push. Currently live at: [https://sql-course-plum.vercel.app](https://sql-course-plum.vercel.app)

---
*Log last updated: June 16, 2026*
