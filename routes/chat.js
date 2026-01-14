const express = require('express');
const ChatController = require('../controllers/chatController');

const router = express.Router();

// Create a new conversation
router.post('/', ChatController.createConversation);

// Get all conversations for admins (must be before :conversationId)
router.get('/admin', ChatController.getAdminConversations);

// Get conversations for a specific user
router.get('/user/:userId', ChatController.getUserConversations);

// Get a specific conversation with messages
router.get('/:conversationId', ChatController.getConversation);

// Add message to conversation
router.post('/:conversationId/messages', ChatController.addMessage);

// Search messages in a conversation
router.get('/:conversationId/search', ChatController.searchMessages);

// Assign conversation to admin
router.put('/:conversationId/assign', ChatController.assignToAdmin);

// Close conversation
router.put('/:conversationId/close', ChatController.closeConversation);

module.exports = router;
