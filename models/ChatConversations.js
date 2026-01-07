const { query } = require('../config/database');

class ChatConversationsModel {
  static async create(conversationData) {
    const {
      user_id,
      customer_id,
      ticket_id = null,
      subject = null,
      assigned_admin_id = null
    } = conversationData;

    const insertQuery = `
      INSERT INTO chat_conversations (
        user_id,
        customer_id,
        ticket_id,
        subject,
        assigned_admin_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'OPEN')
      RETURNING *;
    `;

    try {
      const result = await query(insertQuery, [
        user_id,
        customer_id,
        ticket_id,
        subject,
        assigned_admin_id
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = `
      SELECT c.*, 
        u.first_name, u.last_name, u.email,
        a.first_name as admin_first_name, a.last_name as admin_last_name
      FROM chat_conversations c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.assigned_admin_id = a.id
      WHERE c.id = $1;
    `;

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting conversation by ID:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    const selectQuery = `
      SELECT c.*, 
        u.first_name, u.last_name, u.email,
        a.first_name as admin_first_name, a.last_name as admin_last_name,
        COUNT(m.id) FILTER (WHERE m.is_read = FALSE AND m.sender_type = 'ADMIN') as unread_count
      FROM chat_conversations c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.assigned_admin_id = a.id
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.user_id = $1
      GROUP BY c.id, u.id, a.id
      ORDER BY c.updated_at DESC;
    `;

    try {
      const result = await query(selectQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting conversations by user ID:', error);
      throw error;
    }
  }

  static async getAllForAdmins(limit = 50, offset = 0) {
    const selectQuery = `
      SELECT c.*, 
        u.first_name, u.last_name, u.email,
        a.first_name as admin_first_name, a.last_name as admin_last_name,
        COUNT(m.id) FILTER (WHERE m.is_read = FALSE AND m.sender_type = 'USER') as unread_count,
        MAX(m.created_at) as last_message_at
      FROM chat_conversations c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.assigned_admin_id = a.id
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.status != 'CLOSED'
      GROUP BY c.id, u.id, a.id
      ORDER BY c.updated_at DESC
      LIMIT $1 OFFSET $2;
    `;

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting conversations for admins:', error);
      throw error;
    }
  }

  static async assignAdmin(conversationId, adminId) {
    const updateQuery = `
      UPDATE chat_conversations
      SET assigned_admin_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [adminId, conversationId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error assigning admin to conversation:', error);
      throw error;
    }
  }

  static async closeConversation(conversationId) {
    const updateQuery = `
      UPDATE chat_conversations
      SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [conversationId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM chat_conversations WHERE status != \'CLOSED\'';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting conversations:', error);
      throw error;
    }
  }
}

module.exports = ChatConversationsModel;
