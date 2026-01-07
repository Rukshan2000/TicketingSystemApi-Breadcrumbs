const { query } = require('../config/database');

class ChatMessagesModel {
  static async create(messageData) {
    const {
      conversation_id,
      sender_id,
      sender_type,
      message,
      attachments = []
    } = messageData;

    const insertQuery = `
      INSERT INTO chat_messages (
        conversation_id,
        sender_id,
        sender_type,
        message,
        attachments
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    try {
      const result = await query(insertQuery, [
        conversation_id,
        sender_id,
        sender_type,
        message,
        JSON.stringify(attachments)
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async getByConversationId(conversationId, limit = 50, offset = 0) {
    const selectQuery = `
      SELECT m.*, 
        u.first_name, u.last_name, u.email
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await query(selectQuery, [conversationId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting messages by conversation ID:', error);
      throw error;
    }
  }

  static async markAsRead(messageId) {
    const updateQuery = `
      UPDATE chat_messages
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [messageId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  static async markConversationAsRead(conversationId, userId) {
    const updateQuery = `
      UPDATE chat_messages
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [conversationId, userId]);
      return result.rows;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    const countQuery = `
      SELECT COUNT(*) FROM chat_messages
      WHERE is_read = FALSE 
      AND conversation_id IN (
        SELECT id FROM chat_conversations WHERE user_id = $1
      );
    `;

    try {
      const result = await query(countQuery, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  static async searchMessages(conversationId, searchTerm) {
    const searchQuery = `
      SELECT m.*, 
        u.first_name, u.last_name, u.email
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1 
      AND m.message ILIKE $2
      ORDER BY m.created_at DESC;
    `;

    try {
      const result = await query(searchQuery, [conversationId, `%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }
}

module.exports = ChatMessagesModel;
