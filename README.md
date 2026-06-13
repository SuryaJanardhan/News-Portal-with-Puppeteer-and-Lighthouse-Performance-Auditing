# 📰 Chronicle News Portal & Lighthouse Performance Auditing

A lightweight, premium multi-page news portal built with **Node.js/Express**, optimized for state-of-the-art web performance and accessibility. The project features automated **Lighthouse performance and accessibility audits** run via **Puppeteer**.

---

## ⚡ Key Achievements & Scores

Through rigorous main-thread optimization and resource allocation, this portal achieves near-perfect scores under Lighthouse's simulated mobile throttling profile (4G connection, 4x CPU slowdown):

| Page Route | Performance Score | Accessibility Score | SEO & Best Practices |
| :--- | :---: | :---: | :---: |
| **`/articles`** (Listing) | **100 / 100** | **100 / 100** | **100 / 100** |
| **`/article/:id`** (Detail) | **99 - 100 / 100** | **100 / 100** | **100 / 100** |

---

## 🚀 Performance Optimization Suite

We achieved maximum speed and zero-blocking times by addressing core bottlenecks in browser parsing, layout, and rendering engines:

### 1. Route-Specific Conditional Critical CSS
- **The Problem**: Inlining the entire CSS file led to synchronous parser-blocking overhead on the main thread, while using `<link rel="stylesheet">` triggered a "Render-blocking resources" warning.
- **The Solution**: We implemented dynamic CSS delivery. The **Article Detail** route inlines a highly targeted **Critical CSS** bundle (`< 3KB`) containing *only* the styling required for detail view components. Other routes utilize parallelized and cached external stylesheet links to ensure the browser retrieves styling concurrently without blocking HTML parser threads.

### 2. Layout & Rendering Isolation (CSS Containment)
- **CSS Containment**: We applied `contain: layout style paint;` to isolated content blocks (`.app-header`, `.app-footer`, `.detail-container`, and `.detail-image`). This signals to Chrome's rendering engine that modifications inside these nodes do not propagate to the rest of the DOM, cutting layout recalculation tree depth.
- **Content Visibility**: Used `content-visibility: auto;` and `contain-intrinsic-size` on below-the-fold elements (such as `.app-footer` and `.back-link-wrapper`). This tells the browser to skip layout and paint processes for these off-screen elements during initial page load.
- **Speed-Optimized Text**: Applied `text-rendering: optimizeSpeed;` to bypass expensive glyph kerning and ligatures on long paragraph structures.

### 3. Cumulative Layout Shift (CLS) Mitigation
- **Aspect Ratio Locking**: Explicit `aspect-ratio: 800 / 440;` styling is set directly on image elements, reserving space inside the DOM layout tree prior to resource fetching and avoiding subsequent reflows.
- **Layout Restructuring**: Removed expensive sticky positioning (`position: sticky;`) from the header to completely avoid sticky positioning scroll calculation loops on the main thread.

### 4. Background Image Decoding
- Added `decoding="async"` to image tags. This forces Chrome to decode svg-encoded data URIs asynchronously on helper threads, keeping the browser's main execution loop free of decoding overhead.

### 5. Server-Level Compression & Caching
- Enabled Gzip compression on all HTML, CSS, and JS payloads using the `compression` middleware.
- Configured aggressive static asset caching headers (`Cache-Control: max-age=31536000`) for the `/public` static directory.

---

## ♿ Accessibility (a11y) Architecture

Chronicle News complies with WCAG AAA recommendations, boasting a perfect **100/100** accessibility rating:
- **WCAG High-Contrast Color Palette**: Utilizes curated slate and blue HSL color tokens yielding high contrast ratios against light backgrounds.
- **Focus Indicators**: Configured highly visible outlines (`outline: 3px solid var(--border-focus); outline-offset: 3px;`) targeting `:focus-visible` elements for seamless keyboard navigation.
- **Semantic HTML & ARIA tags**: Utilizes appropriate HTML5 semantic landmarks (`<header>`, `<main>`, `<footer`, `<article>`) and descriptive `aria-label` tags for all navigation anchor elements.
- **Screen Reader Helpers**: Includes a utility `.sr-only` class to hide descriptive form labels from the layout while remaining visible to screen readers.

---

## ⚙️ Run the Application

Start the Express backend locally:

```bash
# Install dependencies & start server
npm install
npm start
```

Once running, navigate to the following routes:
- **Articles Listing**: `http://localhost:3000/articles`
- **Article Details**: `http://localhost:3000/article/1`
- **Search Results**: `http://localhost:3000/search?q=technology`

---

## 📊 Run Performance Audits

To trigger automated performance test audits using Puppeteer and Lighthouse:

```bash
# Starts the server, runs Puppeteer+Lighthouse audits, and stops the server
npm test
```

Reports are automatically generated and saved in:
- `/performance-reports/articles-lighthouse.json`
- `/performance-reports/article-detail-lighthouse.json`

Performance test suites:
- `/tests/performance/lighthouse-articles.test.js`
- `/tests/performance/lighthouse-detail.test.js`
