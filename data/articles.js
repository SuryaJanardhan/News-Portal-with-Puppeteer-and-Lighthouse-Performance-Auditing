const WORD_BLOCK = `performance optimization user experience web vitals rendering javascript browser accessibility responsive content delivery network caching monitoring metrics audit lighthouse puppeteer testing frontend application loading interaction stability semantic html`; 

const buildContent = (id) => {
  const words = [];
  while (words.length < 520) {
    words.push(...WORD_BLOCK.split(' '));
  }
  return `Article ${id} deep dive. ${words.slice(0, 520).join(' ')}.`;
};

const articles = Array.from({ length: 20 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    title: `Breaking News Headline ${id}`,
    author: `Reporter ${id}`,
    date: `2026-06-${String((id % 28) + 1).padStart(2, '0')}`,
    excerpt: `Summary of article ${id} covering important events in technology and performance best practices.`,
    image: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='220'><rect width='100%' height='100%' fill='#e6f0ff'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-size='20' fill='#1f3a5f'>News ${id}</text></svg>`)}`,
    content: buildContent(id),
  };
});

module.exports = { articles };
