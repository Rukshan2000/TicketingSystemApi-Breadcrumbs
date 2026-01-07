const { query } = require('../config/database');

class TicketsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS support_tickets (
        id BIGSERIAL PRIMARY KEY,
        customer_id BIGINT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
        product_id VARCHAR(100) NULL,
        order_id VARCHAR(100) NULL,
        attachments JSONB DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Support tickets table created successfully');
    } catch (error) {
      console.error('Error creating support_tickets table:', error);
      throw error;
    }
  }

  static async create(ticket) {
    const {
      customer_id,
      subject,
      description,
      category,
      priority = 'Medium',
      product_id = null,
      order_id = null,
      attachments = [],
      status = 'Open',
    } = ticket;

    const insertQuery = `
      INSERT INTO support_tickets (
        customer_id,
        subject,
        description,
        category,
        priority,
        product_id,
        order_id,
        attachments,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      customer_id,
      subject,
      description,
      category,
      priority,
      product_id,
      order_id,
      JSON.stringify(attachments),
      status,
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM support_tickets WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting ticket by ID:', error);
      throw error;
    }
  }

  static async getByCustomerId(customerId) {
    const selectQuery = 'SELECT * FROM support_tickets WHERE customer_id = $1 ORDER BY created_at DESC';

    try {
      const result = await query(selectQuery, [customerId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting tickets by customer ID:', error);
      throw error;
    }
  }

  static async getAll(limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw error;
    }
  }

  static async getByStatus(status, limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM support_tickets WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';

    try {
      const result = await query(selectQuery, [status, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting tickets by status:', error);
      throw error;
    }
  }

  static async getByCategory(category, limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM support_tickets WHERE category = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';

    try {
      const result = await query(selectQuery, [category, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting tickets by category:', error);
      throw error;
    }
  }

  static async getByPriority(priority, limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM support_tickets WHERE priority = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';

    try {
      const result = await query(selectQuery, [priority, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting tickets by priority:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramCount}`);
        if (key === 'attachments') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    });

    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);

    const updateQuery = `
      UPDATE support_tickets
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM support_tickets WHERE id = $1';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM support_tickets';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting tickets:', error);
      throw error;
    }
  }

  static async countByStatus(status) {
    const countQuery = 'SELECT COUNT(*) FROM support_tickets WHERE status = $1';

    try {
      const result = await query(countQuery, [status]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting tickets by status:', error);
      throw error;
    }
  }

  static async searchByDateRange(startDate, endDate) {
    const searchQuery = `
      SELECT * FROM support_tickets
      WHERE created_at >= $1 AND created_at <= $2
      ORDER BY created_at DESC
    `;

    try {
      const result = await query(searchQuery, [startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error searching tickets by date range:', error);
      throw error;
    }
  }

  static async search(filters = {}, limit = 10, offset = 0) {
    let query_str = 'SELECT * FROM support_tickets WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.customer_id) {
      query_str += ` AND customer_id = $${paramCount}`;
      values.push(filters.customer_id);
      paramCount++;
    }

    if (filters.status) {
      query_str += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.category) {
      query_str += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.priority) {
      query_str += ` AND priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.product_id) {
      query_str += ` AND product_id = $${paramCount}`;
      values.push(filters.product_id);
      paramCount++;
    }

    query_str += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    try {
      const result = await query(query_str, values);
      return result.rows;
    } catch (error) {
      console.error('Error searching tickets:', error);
      throw error;
    }
  }
}

module.exports = TicketsModel;
