const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const searchTerms = `MNC internship internship 2026 students apply`;
    const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTerms)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 5000
    });
    const $ = cheerio.load(response.data);
    $('.result').each((i, el) => {
      if (i >= 5) return;
      const titleEl = $(el).find('.result__title a');
      const ddgHref = titleEl.attr('href') || '';
      console.log(`Href ${i}: ${ddgHref}`);
      
      let cleanUrl = '';
      if (ddgHref.includes('uddg=')) {
        const paramMatch = ddgHref.match(/uddg=([^&]+)/);
        if (paramMatch && paramMatch[1]) {
          cleanUrl = decodeURIComponent(paramMatch[1]);
        }
      }
      console.log(`Clean URL ${i}: ${cleanUrl}`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
