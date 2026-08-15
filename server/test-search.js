const mongoose = require('mongoose');
const SearchService = require('./services/searchService');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/campuscognition');
  console.log('Testing searchService...');
  
  const res = await SearchService.search({ query: 'MNC internship', type: 'internship' });
  console.log(JSON.stringify(res.results.map(r => ({ title: r.title, url: r.url })), null, 2));
  
  process.exit(0);
}

test();
