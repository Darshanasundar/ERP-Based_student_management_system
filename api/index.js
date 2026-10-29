const app = require('../backend/src/app');

// Vercel serverless function handler
module.exports = (req, res) => {
  // Normalize URL prefix so Express router matches regardless of Vercel rewrite behavior
  if (!req.url.startsWith('/api') && !req.url.startsWith('/health')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
