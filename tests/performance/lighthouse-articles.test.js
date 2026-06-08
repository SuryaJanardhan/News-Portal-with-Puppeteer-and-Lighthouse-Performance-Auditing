const fs = require('node:fs');
const path = require('node:path');
const lighthouse = require('lighthouse').default;
const puppeteer = require('puppeteer');

const appUrl = process.env.APP_URL || 'http://localhost:3000/articles';
const reportsDir = path.resolve(__dirname, '..', '..', 'performance-reports');
const reportPath = path.join(reportsDir, 'articles-lighthouse.json');

const ensureReportsDir = () => {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
};

const assertThreshold = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(appUrl, { waitUntil: 'networkidle0' });

    const { lhr } = await lighthouse(appUrl, {
      port: Number(new URL(browser.wsEndpoint()).port),
      output: 'json',
      logLevel: 'error',
      disableStorageReset: true,
    });

    ensureReportsDir();
    fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));

    const perfScore = lhr.categories.performance.score * 100;
    const a11yScore = lhr.categories.accessibility.score * 100;
    const fcp = lhr.audits['first-contentful-paint'].numericValue;
    const lcp = lhr.audits['largest-contentful-paint'].numericValue;
    const cls = lhr.audits['cumulative-layout-shift'].numericValue;
    const tbt = lhr.audits['total-blocking-time'].numericValue;

    assertThreshold(perfScore >= 85, `Performance score below budget: ${perfScore}`);
    assertThreshold(a11yScore >= 90, `Accessibility score below budget: ${a11yScore}`);
    assertThreshold(fcp <= 2000, `FCP above budget: ${fcp}ms`);
    assertThreshold(lcp <= 2500, `LCP above budget: ${lcp}ms`);
    assertThreshold(cls <= 0.1, `CLS above budget: ${cls}`);
    assertThreshold(tbt <= 300, `TBT above budget: ${tbt}ms`);

    console.log(`Articles page performance score: ${perfScore}`);
    console.log(`Articles page accessibility score: ${a11yScore}`);
  } catch (error) {
    console.error('Failed to run Lighthouse articles audit:', error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
