const express = require('express');
const ReportsController = require('../controllers/reportsController');

const router = express.Router();

/**
 * @route   GET /api/reports/tables
 * @desc    Get available tables and columns for reporting
 * @access  Public
 */
router.get('/tables', ReportsController.getAvailableTables);

/**
 * @route   POST /api/reports/custom
 * @desc    Execute a custom report query with flexible joins
 * @access  Public
 * @body    {
 *            baseTable: string,
 *            joins: string[],
 *            columns: { table: string, column: string, alias?: string }[],
 *            filters: { table: string, column: string, operator: string, value: any }[],
 *            groupBy: { table: string, column: string }[],
 *            aggregations: { function: string, table: string, column: string, alias?: string }[],
 *            orderBy: { table: string, column: string, direction: string }[],
 *            limit: number,
 *            offset: number
 *          }
 */
router.post('/custom', ReportsController.executeCustomReport);

/**
 * @route   POST /api/reports/export
 * @desc    Export report data to CSV or JSON
 * @access  Public
 */
router.post('/export', ReportsController.exportReport);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get dashboard summary with key metrics
 * @access  Public
 * @query   startDate, endDate
 */
router.get('/dashboard', ReportsController.getDashboardSummary);

/**
 * @route   GET /api/reports/tickets/summary
 * @desc    Get ticket summary report
 * @access  Public
 * @query   startDate, endDate, groupBy (status|category|priority), customerId
 */
router.get('/tickets/summary', ReportsController.getTicketSummaryReport);

/**
 * @route   GET /api/reports/users/activity
 * @desc    Get user activity report
 * @access  Public
 * @query   startDate, endDate, userId, role
 */
router.get('/users/activity', ReportsController.getUserActivityReport);

/**
 * @route   GET /api/reports/workflows/performance
 * @desc    Get workflow performance report
 * @access  Public
 * @query   workflowId, startDate, endDate
 */
router.get('/workflows/performance', ReportsController.getWorkflowPerformanceReport);

/**
 * @route   GET /api/reports/reviews/analytics
 * @desc    Get reviews analytics report
 * @access  Public
 * @query   startDate, endDate, minRating, maxRating
 */
router.get('/reviews/analytics', ReportsController.getReviewsAnalyticsReport);

module.exports = router;
