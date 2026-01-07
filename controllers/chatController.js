const ChatConversationsModel = require('../models/ChatConversations');
const ChatMessagesModel = require('../models/ChatMessages');

class ChatController {
  // Create a new conversation
  static async createConversation(req, res) {
    try {
      const { user_id, customer_id, ticket_id, subject } = req.body;

      if (!user_id || !customer_id) {
        return res.status(400).json({ error: 'user_id and customer_id are required' });
      }

      const conversation = await ChatConversationsModel.create({
        user_id,
        customer_id,
        ticket_id: ticket_id || null,
        subject: subject || null
      });

      res.status(201).json({ success: true, data: conversation });
    } catch (error) {
      console.error('Error in createConversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }

  // Get conversation by ID with messages
  static async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const conversation = await ChatConversationsModel.getById(parseInt(conversationId, 10));

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const messages = await ChatMessagesModel.getByConversationId(
        parseInt(conversationId, 10),
        limit,
        offset
      );

      // Mark messages as read for the requester
      const userId = req.user?.id;
      if (userId) {
        await ChatMessagesModel.markConversationAsRead(parseInt(conversationId, 10), userId);
      }

      res.status(200).json({
        success: true,
        data: {
          conversation,
          messages,
          pagination: { limit, offset }
        }
      });
    } catch (error) {
      console.error('Error in getConversation:', error);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  }

  // Get all conversations for a user
  static async getUserConversations(req, res) {
    try {
      const { userId } = req.params;

      const conversations = await ChatConversationsModel.getByUserId(parseInt(userId, 10));

      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }

  // Get all conversations for admins
  static async getAdminConversations(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const conversations = await ChatConversationsModel.getAllForAdmins(limit, offset);
      const count = await ChatConversationsModel.count();

      res.status(200).json({
        success: true,
        data: conversations,
        pagination: { limit, offset, total: count }
      });
    } catch (error) {
      console.error('Error in getAdminConversations:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }

  // Add message to conversation
  static async addMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const { sender_id, message, sender_type = 'USER' } = req.body;

      if (!sender_id || !message) {
        return res.status(400).json({ error: 'sender_id and message are required' });
      }

      // Verify conversation exists
      const conversation = await ChatConversationsModel.getById(parseInt(conversationId, 10));
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const newMessage = await ChatMessagesModel.create({
        conversation_id: parseInt(conversationId, 10),
        sender_id,
        sender_type,
        message
      });

      res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
      console.error('Error in addMessage:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  }

  // Assign conversation to admin
  static async assignToAdmin(req, res) {
    try {
      const { conversationId } = req.params;
      const { admin_id } = req.body;

      if (!admin_id) {
        return res.status(400).json({ error: 'admin_id is required' });
      }

      const updated = await ChatConversationsModel.assignAdmin(
        parseInt(conversationId, 10),
        admin_id
      );

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error('Error in assignToAdmin:', error);
      res.status(500).json({ error: 'Failed to assign conversation' });
    }
  }

  // Close conversation
  static async closeConversation(req, res) {
    try {
      const { conversationId } = req.params;

      const closed = await ChatConversationsModel.closeConversation(parseInt(conversationId, 10));

      res.status(200).json({ success: true, data: closed });
    } catch (error) {
      console.error('Error in closeConversation:', error);
      res.status(500).json({ error: 'Failed to close conversation' });
    }
  }

  // Search messages
  static async searchMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query (q) is required' });
      }

      const results = await ChatMessagesModel.searchMessages(
        parseInt(conversationId, 10),
        q
      );

      res.status(200).json({ success: true, data: results });
    } catch (error) {
      console.error('Error in searchMessages:', error);
      res.status(500).json({ error: 'Failed to search messages' });
    }
  }
}

module.exports = ChatController;
