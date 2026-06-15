// build-course.js — Run with: node build-course.js
// Reads all .md chapter files and generates a self-contained index.html

const fs = require('fs');
const path = require('path');

const dir = __dirname;

const chapters = [
  { id:'ch01', num:'Chapter 01', title:'Introduction to Databases & SQL', img:'images/ch01.png', desc:'What databases are, why SQL exists, and your very first queries on real data.', file:'01-introduction.md' },
  { id:'ch02', num:'Chapter 02', title:'Querying Data — The SELECT Statement', img:'images/ch02.png', desc:'SELECT is the verb you will use in 95% of your queries. Master it here.', file:'02-querying-data-select.md' },
  { id:'ch03', num:'Chapter 03', title:'Data Definition (DDL)', img:'images/ch03.png', desc:'Create databases, design tables, choose data types, and enforce constraints.', file:'03-data-definition-ddl.md' },
  { id:'ch04', num:'Chapter 04', title:'Data Manipulation (DML)', img:'images/ch04.png', desc:'INSERT, UPDATE, DELETE — and how to do it safely with transactions.', file:'04-data-manipulation-dml.md' },
  { id:'ch05', num:'Chapter 05', title:'Filtering Data', img:'images/ch05.png', desc:'WHERE, operators, pattern matching, NULL logic, and EXISTS.', file:'05-filtering-data.md' },
  { id:'ch06', num:'Chapter 06', title:'Combining Data', img:'images/ch06.png', desc:'JOINs, self-joins, UNION, INTERSECT — connecting tables together.', file:'06-combining-data.md' },
  { id:'ch07', num:'Chapter 07', title:'Row-Level Functions', img:'images/ch07.png', desc:'String, numeric, date, NULL-handling, and CASE conditional logic.', file:'07-row-level-functions.md' },
  { id:'ch08', num:'Chapter 08', title:'Aggregation & Analytical Functions', img:'images/ch08.png', desc:'Aggregates, GROUP BY, window functions — the analytics powerhouse.', file:'08-aggregation-analytical-functions.md' },
  { id:'ch09', num:'Chapter 09', title:'Advanced SQL Techniques', img:'images/ch09.png', desc:'Subqueries, CTEs, views, stored procedures, and triggers.', file:'09-advanced-sql-techniques.md' },
  { id:'ch10', num:'Chapter 10', title:'Performance Optimization', img:'images/ch10.png', desc:'Indexes, EXPLAIN, SARGable predicates — make your queries fast.', file:'10-performance-optimization.md' },
  { id:'ch11', num:'Chapter 11', title:'AI & SQL', img:'images/ch11.png', desc:'AI prompt patterns, Python integration, and the modern data stack.', file:'11-ai-and-sql.md' },
  { id:'ch12', num:'Chapter 12', title:'SQL Projects', img:'images/ch12.png', desc:'Six guided capstone projects — put everything together.', file:'12-sql-projects.md' },
];

// Read all markdown files
const mdData = {};
for (const ch of chapters) {
  const fp = path.join(dir, ch.file);
  if (fs.existsSync(fp)) {
    mdData[ch.file] = fs.readFileSync(fp, 'utf8');
  } else {
    mdData[ch.file] = `# ${ch.title}\n\n_Content file not found._`;
  }
}

// Escape for embedding in JS template
function escapeJS(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

// Build the embedded data block
const dataBlock = `const chapterData = {\n${chapters.map(ch => 
  `  "${ch.file}": \`${escapeJS(mdData[ch.file])}\``
).join(',\n')}\n};`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Complete SQL Course — From Zero to Production</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\\/script>
<style>
:root{--bg:#0f1117;--bg-card:#181b23;--bg-code:#1e2029;--bg-th:#232730;--text:#e1e3ea;--dim:#8b8fa3;--bright:#fff;--blue:#5b8def;--purple:#a47de5;--teal:#3ecfb4;--orange:#f0a056;--red:#e85d6f;--green:#4ade80;--border:#2a2e3a;--r:14px;--rs:8px;--font:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono','Consolas',monospace}
[data-theme="light"]{--bg:#f4f0ea;--bg-card:#ffffff;--bg-code:#eef0f4;--bg-th:#eef0f4;--text:#1a1a1a;--dim:#5a5f73;--bright:#000;--blue:#0550ae;--purple:#8250df;--teal:#0d9488;--orange:#e36209;--red:#cf222e;--green:#1a7f37;--border:#d0d7de;}
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:15px;scroll-behavior:smooth}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.8;-webkit-font-smoothing:antialiased}
.w{max-width:880px;margin:0 auto;padding:2rem 2.5rem}

/* Control Panel */
.controls{position:fixed;top:20px;right:20px;display:flex;gap:10px;z-index:100}
.btn{padding:10px 15px;border-radius:20px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);cursor:pointer;font-family:var(--font);font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:0.2s}
.btn:hover{border-color:var(--blue);color:var(--blue)}
.smart-scroll{position:fixed;bottom:20px;right:20px;padding:12px 18px;border-radius:20px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:var(--font);font-weight:600;box-shadow:0 4px 12px rgba(91,141,239,0.3);z-index:100;transition:0.2s}
.smart-scroll:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(91,141,239,0.4)}

/* SPA Pages */
.page{display:none}
.page.active{display:block;animation:fadein 0.3s ease}
@keyframes fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

.cover{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:4rem 2rem;position:relative;overflow:hidden}
.cover::before{content:'';position:absolute;inset:-50%;background:radial-gradient(circle at 30% 40%,rgba(91,141,239,.1)0%,transparent 50%),radial-gradient(circle at 70% 60%,rgba(164,125,229,.07)0%,transparent 50%);pointer-events:none}
.cover img{width:300px;border-radius:24px;margin-bottom:2rem;filter:drop-shadow(0 20px 60px rgba(91,141,239,.3));position:relative;z-index:1}
.cover h1{font-size:3.2rem;font-weight:900;background:linear-gradient(135deg,#5b8def,#a47de5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.15;margin-bottom:.75rem;position:relative;z-index:1}
.cover .sub{font-size:1.3rem;color:var(--dim);margin-bottom:2.5rem;position:relative;z-index:1}
.badges{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;position:relative;z-index:1}
.badge{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:100px;font-size:.85rem;color:var(--dim);font-weight:500}
.badge b{color:var(--blue)}
.toc{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r);padding:2.5rem;margin:3rem 0}
.toc h2{font-size:1.6rem;font-weight:800;color:var(--bright);margin-bottom:1.5rem}
.toc ol{list-style:none;counter-reset:t -1}
.toc li{counter-increment:t;padding:.55rem 0;border-bottom:1px solid var(--border)}
.toc li:last-child{border-bottom:none}
.toc li::before{content:counter(t,decimal-leading-zero)'  ';font-family:var(--mono);font-size:.8rem;color:var(--blue);font-weight:600}
.toc a{color:var(--text);text-decoration:none;font-weight:500;cursor:pointer}
.toc a:hover{color:var(--blue)}
.ch-hdr{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin:0 0 2rem;padding:2rem;display:flex;flex-direction:column;align-items:center;text-align:center;}
.ch-hdr img{width:280px;border-radius:var(--r);margin-bottom:1.5rem}
.ch-n{font-family:var(--mono);font-size:.85rem;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:.15em;margin-bottom:.4rem}
.ch-hdr h2{font-size:2.1rem;font-weight:800;color:var(--bright);line-height:1.2;margin-bottom:.5rem}
.ch-hdr p{color:var(--dim);max-width:600px}

/* Chapter Nav Buttons */
.nav-buttons{display:flex;justify-content:space-between;margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border)}

.md h2{font-size:1.65rem;font-weight:700;color:var(--bright);margin:2.5rem 0 .75rem;padding-bottom:.5rem;border-bottom:2px solid var(--border)}
.md h3{font-size:1.3rem;font-weight:600;color:var(--teal);margin:2rem 0 .5rem}
.md h4{font-size:1.1rem;font-weight:600;color:var(--purple);margin:1.5rem 0 .5rem}
.md h5{font-size:1rem;font-weight:600;color:var(--orange);margin:1.2rem 0 .4rem}
.md p{margin:.7rem 0}
.md strong{color:var(--bright)}
.md em{color:var(--dim);font-style:italic}
.md ul,.md ol{margin:.7rem 0;padding-left:1.5rem}
.md li{margin:.3rem 0}
.md hr{border:none;border-top:1px solid var(--border);margin:2.5rem 0}
.md pre{background:var(--bg-code);border:1px solid var(--border);border-radius:var(--rs);padding:1.2rem 1.4rem;overflow-x:auto;margin:1rem 0}
.md pre code{font-family:var(--mono);font-size:.84rem;line-height:1.7;color:#c9d1d9;background:none!important;padding:0!important;border:none!important;display:block}
.md code{font-family:var(--mono);font-size:.84em;background:var(--bg-code);padding:.15em .4em;border-radius:4px;color:var(--teal);border:1px solid var(--border)}
.md table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.88rem;border:1px solid var(--border);border-radius:var(--rs);overflow:hidden}
.md thead{background:var(--bg-th)}
.md th{padding:.7rem 1rem;text-align:left;font-weight:600;color:var(--blue);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid var(--border)}
.md td{padding:.55rem 1rem;border-bottom:1px solid var(--border)}
.md tr:last-child td{border-bottom:none}
.md td code{font-size:.8em;padding:.1em .3em}
.md blockquote{border-left:4px solid var(--teal);background:rgba(62,207,180,.06);border-radius:var(--rs);padding:1rem 1.3rem;margin:1.2rem 0;font-size:.92rem}
.md blockquote p{margin:.3rem 0}
.md blockquote strong{color:var(--teal)}

@media(max-width:768px){html{font-size:14px}.w{padding:1rem}.cover h1{font-size:2.2rem}.ch-hdr h2{font-size:1.5rem}.ch-hdr img{width:200px}}
</style>
</head>
<body>

<div class="controls">
  <button id="home-btn" class="btn" onclick="navigate('home')">🏠 Home</button>
  <button id="theme-toggle" class="btn">🌓 Theme</button>
</div>

<button id="smart-scroll" class="smart-scroll">⬇ Scroll Down</button>

<div class="w">
  <!-- Home Page -->
  <div id="page-home" class="page active">
    <section class="cover">
      <img src="images/course_hero.png" alt="SQL Course">
      <h1>The Complete SQL Course</h1>
      <p class="sub">From Zero to Production — A Data Analyst's Training Manual</p>
      <div class="badges">
        <span class="badge"><b>12</b> Chapters</span>
        <span class="badge"><b>120+</b> Exercises</span>
        <span class="badge"><b>6</b> Databases</span>
        <span class="badge"><b>6</b> Projects</span>
        <span class="badge">MySQL 8.0 · PostgreSQL 15+</span>
      </div>
    </section>
    <nav class="toc">
      <h2>📋 Table of Contents</h2>
      <ol id="toc-list"></ol>
    </nav>
  </div>

  <div id="chapters-container"></div>
</div>

<script>
${dataBlock}

const chapters = ${JSON.stringify(chapters)};

// Markdown Config
marked.setOptions({ gfm: true, breaks: false });
const renderer = new marked.Renderer();
renderer.code = function(text, lang) {
  let code = typeof text === 'object' ? (text.text||'') : (text||'');
  code = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return '<pre><code>'+code+'</code></pre>';
};
renderer.heading = function(text, level) {
  let c = typeof text === 'object' ? (text.text||'') : text;
  let l = typeof text === 'object' ? (text.depth||2) : level;
  if (l === 1) return '';
  return '<h'+l+'>'+c+'</h'+l+'>';
};
marked.use({ renderer });

// Build TOC and Pages
const tocList = document.getElementById('toc-list');
const container = document.getElementById('chapters-container');

chapters.forEach((ch, index) => {
  // TOC Entry
  const li = document.createElement('li');
  li.innerHTML = \`<a onclick="navigate('\${ch.id}')">\${ch.title}</a>\`;
  tocList.appendChild(li);

  // Chapter Page
  const page = document.createElement('div');
  page.className = 'page';
  page.id = 'page-' + ch.id;

  // Header
  const hdr = document.createElement('div');
  hdr.className = 'ch-hdr';
  hdr.innerHTML = '<img src="'+ch.img+'" alt="'+ch.title+'"><div class="ch-n">'+ch.num+'</div><h2>'+ch.title+'</h2><p>'+ch.desc+'</p>';
  page.appendChild(hdr);

  // Content
  const md = document.createElement('div');
  md.className = 'md';
  let src = chapterData[ch.file] || '_No content_';
  src = src.replace(/^# .+$/m, ''); // Remove H1
  md.innerHTML = marked.parse(src);
  page.appendChild(md);

  // Navigation Buttons
  const navBtns = document.createElement('div');
  navBtns.className = 'nav-buttons';
  
  let prevBtn = index > 0 ? \`<button class="btn" onclick="navigate('\${chapters[index-1].id}')">← Previous Chapter</button>\` : \`<div></div>\`;
  let nextBtn = index < chapters.length - 1 ? \`<button class="btn" onclick="navigate('\${chapters[index+1].id}')">Next Chapter →</button>\` : \`<div></div>\`;
  
  navBtns.innerHTML = prevBtn + nextBtn;
  page.appendChild(navBtns);

  container.appendChild(page);
});

// Navigation Logic
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (pageId === 'home') {
    document.getElementById('page-home').classList.add('active');
    location.hash = '';
  } else {
    document.getElementById('page-' + pageId).classList.add('active');
    location.hash = pageId;
  }
  window.scrollTo(0,0);
}

// Handle Hash Routing
if (location.hash && location.hash.length > 1) {
  const hash = location.hash.substring(1);
  if (chapters.some(ch => ch.id === hash)) {
    navigate(hash);
  }
}

// Smart Scroll
const scrollBtn = document.getElementById('smart-scroll');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollBtn.innerHTML = '⬆ Scroll Up';
    scrollBtn.onclick = () => window.scrollTo(0, 0);
  } else {
    scrollBtn.innerHTML = '⬇ Scroll Down';
    scrollBtn.onclick = () => window.scrollTo(0, document.body.scrollHeight);
  }
});

// Theme Toggle
const toggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('sql_theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
toggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sql_theme', theme);
});
<\\/script>
</body>
</html>`;

// Fix the escaped script tags
const finalHtml = html.split('<\\/script>').join('</script>');

fs.writeFileSync(path.join(dir, 'index.html'), finalHtml, 'utf8');
console.log('Built index.html successfully!');
console.log('Size: ' + (finalHtml.length / 1024).toFixed(0) + ' KB');
