# News Portal with Puppeteer and Lighthouse Performance Auditing

A lightweight multi-page news portal with automated Lighthouse performance testing using Puppeteer.

## Run the application

Single command to install dependencies and start the app:

```bash
npm install && npm start
```

The app runs at `http://localhost:3000` with key routes:
- `/articles`
- `/article/:id`
- `/search?q=your-query`

## Run performance audits and generate reports

Single command to install dependencies, start the app, run audits, and generate JSON reports:

```bash
npm install && npm run test:performance
```

Reports are generated in:
- `/performance-reports/articles-lighthouse.json`
- `/performance-reports/article-detail-lighthouse.json`

Performance test files are in:
- `/tests/performance/lighthouse-articles.test.js`
- `/tests/performance/lighthouse-detail.test.js`
