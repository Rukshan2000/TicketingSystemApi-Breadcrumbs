const express = require('express');
const WorkflowsController = require('../controllers/workflowsController');

const router = express.Router();

// ==================== TICKET APPROVAL ROUTES ====================

// Get pending approvals for a user (tickets)
router.get('/pending', WorkflowsController.getPendingApprovals);

// Get tickets pending approval (dashboard view)
router.get('/tickets/pending', WorkflowsController.getTicketsPendingApproval);

// ==================== REPRINT REQUEST APPROVAL ROUTES ====================

// Get pending reprint request approvals for a user
router.get('/reprint-requests/pending', WorkflowsController.getPendingReprintRequestApprovals);

// Get reprint requests pending approval (dashboard view)
router.get('/reprint-requests/list', WorkflowsController.getReprintRequestsPendingApproval);

// ==================== APPROVAL PROGRESS ROUTES ====================

// Get approval progress for a specific ticket
router.get('/progress/ticket/:id', WorkflowsController.getApprovalProgress);

// Get approval progress for a specific reprint request
router.get('/progress/reprint-request/:id', WorkflowsController.getApprovalProgress);

// Get approval progress summary for multiple items
router.get('/progress/summary', WorkflowsController.getApprovalProgressSummary);

module.exports = router;
