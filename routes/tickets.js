const express = require('express');
const TicketsController = require('../controllers/ticketsController');
const WorkflowsController = require('../controllers/workflowsController');
const upload = require('../middleware/upload');

const router = express.Router();

// Create a new ticket (with optional attachments)
router.post('/', upload.array('attachments', 10), TicketsController.createTicket);

// Get all tickets with pagination
router.get('/', TicketsController.getAllTickets);

// Get tickets by customer (query params) - with filters
router.get('/by-customer/search', TicketsController.getTicketsByCustomerQuery);

// Get ticket count
router.get('/count', TicketsController.getTicketCount);

// Search tickets by filters
router.get('/search/filters', TicketsController.searchTickets);

// Search tickets by date range
router.get('/search/date-range', TicketsController.searchByDateRange);

// Get tickets by customer ID
router.get('/customer/:customerId', TicketsController.getTicketsByCustomerId);

// Get tickets by status
router.get('/status/:status', TicketsController.getTicketsByStatus);

// Get tickets by category
router.get('/category/:category', TicketsController.getTicketsByCategory);

// Get tickets by priority
router.get('/priority/:priority', TicketsController.getTicketsByPriority);

// Get ticket by ID
router.get('/:id', TicketsController.getTicketById);

// Update ticket
router.put('/:id', TicketsController.updateTicket);

// Delete ticket
router.delete('/:id', TicketsController.deleteTicket);

// Add attachment to ticket
router.post('/:id/attachments', upload.single('attachment'), TicketsController.addAttachment);

// Remove attachment from ticket
router.delete('/:id/attachments/:attachmentIndex', TicketsController.removeAttachment);

// ==================== TICKET WORKFLOW ROUTES ====================

// Initialize workflow for a ticket
router.post('/:ticketId/workflow', WorkflowsController.initializeWorkflow);

// Get approval status and history for a ticket
router.get('/:ticketId/approvals', WorkflowsController.getTicketApprovals);

// Approve or reject a ticket
router.post('/:ticketId/approve', WorkflowsController.approveTicket);

module.exports = router;

// Delete ticket
router.delete('/:id', TicketsController.deleteTicket);

// Add attachment to ticket
router.post('/:id/attachments', upload.single('attachment'), TicketsController.addAttachment);

// Remove attachment from ticket
router.delete('/:id/attachments/:attachmentIndex', TicketsController.removeAttachment);

// ==================== TICKET WORKFLOW ROUTES ====================

// Initialize workflow for a ticket
router.post('/:ticketId/workflow', WorkflowsController.initializeWorkflow);

// Get approval status and history for a ticket
router.get('/:ticketId/approvals', WorkflowsController.getTicketApprovals);

// Approve or reject a ticket
router.post('/:ticketId/approve', WorkflowsController.approveTicket);

module.exports = router;
