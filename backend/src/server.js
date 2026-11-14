const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    project: 'AgroChrono-BD',
    version: '1.0.0',
    description: 'AI/ML-Assisted Agricultural Crop-Calendar Validation Platform for Bangladesh',
    apiStatus: 'Online',
    documentation: '/api/health',
    endpoints: [
      'GET  /api/health',
      'GET  /api/options',
      'POST /api/validate',
      'GET  /api/weather',
      'GET  /api/reference',
      'POST /api/analyze',
      'POST /api/reanalyze',
      'GET  /api/results/:id',
      'GET  /api/history'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` AgroChrono-BD Backend Server running on port ${PORT}`);
    console.log(` Health API: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();
