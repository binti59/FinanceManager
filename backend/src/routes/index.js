const express = require('express');
const app = express();

// Import routes
app.use('/api/auth', require('./auth.routes'));
app.use('/api/health', require('./health.routes'));

module.exports = app;
