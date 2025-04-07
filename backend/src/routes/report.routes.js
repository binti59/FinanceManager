const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateReportRequest } = require('../validators/report.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Generate income statement report
router.get('/income-statement', validateReportRequest, reportController.generateIncomeStatement);

// Generate balance sheet report
router.get('/balance-sheet', validateReportRequest, reportController.generateBalanceSheet);

// Generate cash flow report
router.get('/cash-flow', validateReportRequest, reportController.generateCashFlow);

// Generate expense by category report
router.get('/expense-by-category', validateReportRequest, reportController.generateExpenseByCategory);

// Generate income by category report
router.get('/income-by-category', validateReportRequest, reportController.generateIncomeByCategory);

// Generate net worth history report
router.get('/net-worth-history', validateReportRequest, reportController.generateNetWorthHistory);

// Generate financial independence report
router.get('/financial-independence', reportController.generateFinancialIndependence);

// Export report data
router.post('/export', validateReportRequest, reportController.exportReportData);

module.exports = router;
