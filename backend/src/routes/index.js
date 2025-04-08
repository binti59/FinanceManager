const express = require('express');
const app = express();

// Import routes
app.use('/api/auth', require('./auth.routes'));
app.use('/api/health', require('./health.routes'));
app.use('/api/user', require('./user.routes'));
app.use('/api/account', require('./account.routes'));
app.use('/api/transaction', require('./transaction.routes'));
app.use('/api/category', require('./category.routes'));
app.use('/api/budget', require('./budget.routes'));
app.use('/api/goal', require('./goal.routes'));
app.use('/api/asset', require('./asset.routes'));
app.use('/api/report', require('./report.routes'));

module.exports = app;
