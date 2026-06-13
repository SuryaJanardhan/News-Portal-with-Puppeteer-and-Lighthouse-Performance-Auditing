const express = require('express');
const compression = require('compression');
const escapeHtml = require('escape-html');
const { articles } = require('./data/articles');

const app = express();
const port = process.env.PORT || 3000;

// Highly targeted Critical CSS for the Article Detail page only (no unused rules, under 3KB)
const detailCss = `:root{--font-sans:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--font-serif:Georgia,Cambria,"Times New Roman",Times,serif;--bg-primary:#f8fafc;--bg-surface:#ffffff;--bg-footer:#0f172a;--text-primary:#0f172a;--text-secondary:#334155;--text-muted:#4b5563;--text-on-dark:#f8fafc;--primary:#1d4ed8;--primary-hover:#1e40af;--primary-light:#eff6ff;--border:#cbd5e1;--border-focus:#1d4ed8;--shadow-sm:0 1px 2px 0 rgba(0, 0, 0, 0.05);--shadow-md:0 4px 6px -1px rgba(0, 0, 0, 0.08),0 2px 4px -2px rgba(0, 0, 0, 0.08);--shadow-lg:0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -4px rgba(0, 0, 0, 0.1);--radius-sm:6px;--radius-md:10px;--radius-lg:14px;--transition:all 0.15s ease-out}*,*::before,*::after{box-sizing:border-box}body,h1,p,ul,li,figure,figcaption,blockquote,dl,dd{margin:0;padding:0}body{font-family:var(--font-sans);background:var(--bg-primary);color:var(--text-primary);min-height:100vh;display:flex;flex-direction:column;line-height:1.6;text-rendering:optimizeSpeed;-webkit-font-smoothing:antialiased}main{flex:1;max-width:1200px;width:100%;margin:0 auto;padding:2rem 1.5rem}a:focus-visible{outline:3px solid var(--border-focus);outline-offset:3px}h1{font-family:var(--font-serif);font-size:2.5rem;font-weight:700;line-height:1.2;margin-bottom:1.5rem;color:var(--text-primary);position:relative}h1::after{content:'';display:block;width:50px;height:4px;background:var(--primary);margin-top:0.5rem;border-radius:2px}.app-header{background:var(--bg-surface);border-bottom:1px solid var(--border);box-shadow:var(--shadow-sm);background:rgba(255,255,255,0.98);contain:layout style paint}.header-container{max-width:1200px;margin:0 auto;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center}.logo{font-size:1.4rem;font-weight:800;text-decoration:none;color:var(--text-primary);letter-spacing:-0.5px}.logo span{color:var(--primary)}.nav-links{display:flex;gap:1.25rem}.nav-link{font-size:0.95rem;font-weight:600;text-decoration:none;color:var(--text-secondary);transition:var(--transition);padding:0.25rem 0.5rem;border-bottom:2px solid transparent}.nav-link:hover,.nav-link.active{color:var(--primary);border-bottom-color:var(--primary)}.detail-container{max-width:800px;margin:0 auto;contain:layout style paint}.detail-container h1{font-size:2.5rem;margin-bottom:0.75rem}.detail-author,.detail-date{font-size:0.9rem;color:var(--text-muted);display:inline-block;margin-bottom:0.5rem;contain:layout style paint}.detail-author{color:var(--text-secondary);font-weight:600;margin-right:0.75rem}.detail-image{width:100%;max-width:100%;height:auto;aspect-ratio:800/440;display:block;border-radius:var(--radius-lg);margin:1.5rem 0;box-shadow:var(--shadow-sm);contain:layout paint}.detail-text{font-family:var(--font-sans);font-size:1.1rem;line-height:1.6;color:var(--text-primary);margin-bottom:2rem;contain:layout paint;text-rendering:optimizeSpeed}.back-link-wrapper{border-top:1px solid var(--border);padding-top:1.25rem;contain:layout style paint;content-visibility:auto;contain-intrinsic-size:auto 50px}.back-link-wrapper a{font-weight:700;color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;transition:var(--transition)}.back-link-wrapper a:hover{color:var(--primary-hover);transform:translateX(-3px)}.back-link-wrapper a::before{content:'←';font-weight:700}.app-footer{background:var(--bg-footer);color:var(--text-on-dark);padding:2rem 1.5rem;text-align:center;border-top:1px solid rgba(255,255,255,0.08);font-size:0.9rem;margin-top:auto;contain:layout style paint;content-visibility:auto;contain-intrinsic-size:auto 150px}.footer-container{max-width:1200px;margin:0 auto}.footer-container p{opacity:0.7}@media (max-width: 768px){h1{font-size:2.1rem}.detail-container h1{font-size:2.1rem}}`;

// Enable gzip compression
app.use(compression());

// Serve static files with caching
app.use('/public', express.static('public', {
  maxAge: '1y',
  etag: true
}));

const baseHtml = (title, body, inlineStyle = false) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A premium and high-performance news portal auditing web performance and accessibility with Puppeteer and Lighthouse." />
    <title>${title} | Chronicle News</title>
    ${inlineStyle ? `<style>${detailCss}</style>` : `<link rel="stylesheet" href="/public/styles.css" />`}
  </head>
  <body>
    <header class="app-header">
      <div class="header-container">
        <a href="/articles" class="logo">Chronicle<span>News</span></a>
        <nav class="nav-links">
          <a href="/articles" class="nav-link active">Home</a>
          <a href="/search" class="nav-link">Search</a>
        </nav>
      </div>
    </header>
    <main>${body}</main>
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2026 Chronicle News. Built with speed, beauty, and accessibility.</p>
      </div>
    </footer>
  </body>
</html>`;

const renderSearchForm = (query = '') => `
<form class="search-row" action="/search" method="get">
  <label for="search-input" class="sr-only">Search articles</label>
  <input id="search-input" data-testid="search-input" type="text" name="q" placeholder="Type keywords to search..." value="${escapeHtml(query)}" />
  <button data-testid="search-button" type="submit">Search</button>
</form>`;

app.get('/', (_req, res) => {
  res.redirect('/articles');
});

app.get('/articles', (_req, res) => {
  const cards = articles
    .map(
      (article, index) => `
      <article class="card" data-testid="article-card-${article.id}">
        <div class="image-container">
          <img src="${article.image}" alt="${escapeHtml(article.title)}" ${index >= 3 ? 'loading="lazy"' : ''} width="400" height="220" decoding="async" />
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="category-tag">General</span>
            <span class="meta-dot"></span>
            <span class="date-tag">${escapeHtml(article.date)}</span>
          </div>
          <h2 data-testid="article-title-${article.id}">${escapeHtml(article.title)}</h2>
          <p data-testid="article-excerpt-${article.id}">${escapeHtml(article.excerpt)}</p>
          <a data-testid="article-link-${article.id}" href="/article/${article.id}" aria-label="Read full article: ${escapeHtml(article.title)}">Read more</a>
        </div>
      </article>`
    )
    .join('');

  res.send(
    baseHtml(
      'News Articles',
      `<h1>Latest Articles</h1>
      ${renderSearchForm()}
      <section class="cards" data-testid="articles-list">${cards}</section>`,
      false
    )
  );
});

app.get('/article/:id', (req, res) => {
  const article = articles.find((entry) => entry.id === Number(req.params.id));
  if (!article) {
    return res.status(404).send(baseHtml('Not Found', '<h1>Article not found</h1><a href="/articles">Back to articles</a>', false));
  }

  res.send(
    baseHtml(
      article.title,
      `<article class="detail-container">
        <h1 data-testid="article-title">${escapeHtml(article.title)}</h1>
        <p data-testid="article-author" class="detail-author">By ${escapeHtml(article.author)}</p>
        <p data-testid="article-date" class="detail-date">Published on ${escapeHtml(article.date)}</p>
        <img class="detail-image" data-testid="article-featured-image" src="${article.image}" alt="Featured image for ${escapeHtml(article.title)}" width="800" height="440" decoding="async" />
        <p data-testid="article-content" class="detail-text">${escapeHtml(article.content)}</p>
        <p class="back-link-wrapper"><a data-testid="back-to-articles" href="/articles">Back to Articles</a></p>
      </article>`,
      true
    )
  );
});

app.get('/search', (req, res) => {
  const query = String(req.query.q || '').trim();
  const normalized = query.toLowerCase();
  const results = articles.filter((article) => {
    if (!normalized) {
      return true;
    }
    return (
      article.title.toLowerCase().includes(normalized) ||
      article.excerpt.toLowerCase().includes(normalized) ||
      article.content.toLowerCase().includes(normalized)
    );
  });

  const resultItems = results
    .map((article) => `<li><a href="/article/${article.id}">${escapeHtml(article.title)}</a></li>`)
    .join('');

  res.send(
    baseHtml(
      'Search Results',
      `<div class="search-page-container">
        <h1>Search Results</h1>
        ${renderSearchForm(query)}
        <p data-testid="search-query-display" class="search-query-text">Query: <strong>${escapeHtml(query || '(all articles)')}</strong></p>
        <p data-testid="results-count" class="results-count-text">${results.length} results found</p>
        <ul data-testid="search-results-list" class="search-results-list">${resultItems}</ul>
      </div>`,
      false
    )
  );
});

// Catch-all 404 route
app.use((_req, res) => {
  res.status(404).send(baseHtml('Not Found', '<div class="not-found-container"><h1>Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/articles" class="btn">Back to Articles</a></div>', false));
});

app.listen(port, () => {
  console.log(`News portal server running at http://localhost:${port}`);
});
