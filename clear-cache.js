const mongoose = require('mongoose');
const SearchCache = require('./server/models/SearchCache');
mongoose.connect('mongodb://localhost:27017/campuscognition')
  .then(() => SearchCache.deleteMany({}))
  .then(() => {
    console.log('Cache cleared');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
