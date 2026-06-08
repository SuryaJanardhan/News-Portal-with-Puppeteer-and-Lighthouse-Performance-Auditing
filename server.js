const express = require('express');
const { articles } = require('./data/articles');

const app = express();
const port = process.env.PORT || 3000;

app.use('/public', express.static('public'));

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const baseHtml = (title, body) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="stylesheet" href="/public/styles.css" />
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>`;

const renderSearchForm = (query = '') => `
<form class="search-row" action="/search" method="get">
  <label for="search-input">Search articles</label>
  <input id="search-input" data-testid="search-input" type="text" name="q" value="${escapeHtml(query)}" />
  <button data-testid="search-button" type="submit">Search</button>
</form>`;

app.get('/', (_req, res) => {
  res.redirect('/articles');
});

app.get('/articles', (_req, res) => {
  const cards = articles
    .map(
      (article) => `
      <article class="card" data-testid="article-card-${article.id}">
        <img src="${article.image}" alt="${escapeHtml(article.title)}" loading="lazy" width="400" height="220" />
        <div class="card-content">
          <h2 data-testid="article-title-${article.id}">${escapeHtml(article.title)}</h2>
          <p data-testid="article-excerpt-${article.id}">${escapeHtml(article.excerpt)}</p>
          <a data-testid="article-link-${article.id}" href="/article/${article.id}">Read more</a>
        </div>
      </article>`
    )
    .join('');

  res.send(
    baseHtml(
      'News Articles',
      `<h1>Latest Articles</h1>
      ${renderSearchForm()}
      <section class="cards" data-testid="articles-list">${cards}</section>`
    )
  );
});

app.get('/article/:id', (req, res) => {
  const article = articles.find((entry) => entry.id === Number(req.params.id));
  if (!article) {
    return res.status(404).send(baseHtml('Not Found', '<h1>Article not found</h1><a href="/articles">Back to articles</a>'));
  }

  res.send(
    baseHtml(
      article.title,
      `<article>
        <h1 data-testid="article-title">${escapeHtml(article.title)}</h1>
        <p data-testid="article-author">By ${escapeHtml(article.author)}</p>
        <p data-testid="article-date">Published on ${escapeHtml(article.date)}</p>
        <img class="detail-image" data-testid="article-featured-image" src="${article.image}" alt="Featured image for ${escapeHtml(article.title)}" width="800" height="440" />
        <p data-testid="article-content">${escapeHtml(article.content)}</p>
        <p><a data-testid="back-to-articles" href="/articles">Back to Articles</a></p>
      </article>`
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
      `<h1>Search Results</h1>
      ${renderSearchForm(query)}
      <p data-testid="search-query-display">Query: ${escapeHtml(query || '(all articles)')}</p>
      <p data-testid="results-count">${results.length} results found</p>
      <ul data-testid="search-results-list">${resultItems}</ul>`
    )
  );
});

app.listen(port, () => {
  console.log(`News portal server running at http://localhost:${port}`);
});
