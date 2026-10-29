const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes/index');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct endpoint as requested: /health returns {"status": "ok"}
app.use('/health', healthRoutes);

// Modular API routes: e.g. /api/...
app.use('/api', apiRoutes);

// Fallback 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
