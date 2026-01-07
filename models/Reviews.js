const { query } = require('../config/database');

class ReviewsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS customer_reviews (
        id BIGSERIAL PRIMARY KEY,
        ticket_id BIGINT NOT NULL,
        customer_id BIGINT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        helpful_count INTEGER DEFAULT 0,
        unhelpful_count INTEGER DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
        UNIQUE(ticket_id, customer_id)
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Customer reviews table created successfully');
    } catch (error) {
      console.error('Error creating customer_reviews table:', error);
      throw error;
    }
  }

  static async create(review) {
    const {
      ticket_id,
      customer_id,
      rating,
      review_text = null,
      status = 'Pending',
    } = review;

    const insertQuery = `
      INSERT INTO customer_reviews (
        ticket_id,
        customer_id,
        rating,
        review_text,
        status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    try {
      const result = await query(insertQuery, [
        ticket_id,
        customer_id,
        rating,
        review_text,
        status,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  static async getAll(limit = 50, offset = 0) {
    const selectQuery = `
      SELECT 
        cr.*,
        st.subject as ticket_subject,
        st.status as ticket_status
      FROM customer_reviews cr
      LEFT JOIN support_tickets st ON cr.ticket_id = st.id
      ORDER BY cr.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving all reviews:', error);
      throw error;
    }
  }

  static async getAllCount() {
    const countQuery = 'SELECT COUNT(*) as count FROM customer_reviews;';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error getting reviews count:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = `
      SELECT 
        cr.*,
        st.subject as ticket_subject,
        st.status as ticket_status,
        st.created_at as ticket_created_at
      FROM customer_reviews cr
      LEFT JOIN support_tickets st ON cr.ticket_id = st.id
      WHERE cr.id = $1;
    `;

    try {
      const result = await query(selectQuery, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error retrieving review:', error);
      throw error;
    }
  }

  static async getByTicketId(ticketId) {
    const selectQuery = `
      SELECT *
      FROM customer_reviews
      WHERE ticket_id = $1;
    `;

    try {
      const result = await query(selectQuery, [ticketId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error retrieving review by ticket:', error);
      throw error;
    }
  }

  static async getByCustomerId(customerId, limit = 50, offset = 0) {
    const selectQuery = `
      SELECT 
        cr.*,
        st.subject as ticket_subject,
        st.status as ticket_status
      FROM customer_reviews cr
      LEFT JOIN support_tickets st ON cr.ticket_id = st.id
      WHERE cr.customer_id = $1
      ORDER BY cr.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await query(selectQuery, [customerId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving reviews by customer:', error);
      throw error;
    }
  }

  static async getByRating(rating, limit = 50, offset = 0) {
    const selectQuery = `
      SELECT 
        cr.*,
        st.subject as ticket_subject,
        st.status as ticket_status
      FROM customer_reviews cr
      LEFT JOIN support_tickets st ON cr.ticket_id = st.id
      WHERE cr.rating = $1
      ORDER BY cr.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await query(selectQuery, [rating, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving reviews by rating:', error);
      throw error;
    }
  }

  static async getByStatus(status, limit = 50, offset = 0) {
    const selectQuery = `
      SELECT 
        cr.*,
        st.subject as ticket_subject,
        st.status as ticket_status
      FROM customer_reviews cr
      LEFT JOIN support_tickets st ON cr.ticket_id = st.id
      WHERE cr.status = $1
      ORDER BY cr.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await query(selectQuery, [status, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving reviews by status:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = [
      'rating',
      'review_text',
      'helpful_count',
      'unhelpful_count',
      'status',
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount += 1;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    values.push(id);

    const updateQuery = `
      UPDATE customer_reviews
      SET ${fields.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM customer_reviews WHERE id = $1 RETURNING *;';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  static async getAverageRating(ticketId = null) {
    let selectQuery = `
      SELECT 
        ROUND(AVG(rating)::numeric, 2) as average_rating,
        COUNT(*) as total_reviews
    `;

    if (ticketId) {
      selectQuery += ` FROM customer_reviews WHERE ticket_id = $1;`;
    } else {
      selectQuery += ` FROM customer_reviews;`;
    }

    try {
      const result = await query(
        selectQuery,
        ticketId ? [ticketId] : []
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting average rating:', error);
      throw error;
    }
  }

  static async markHelpful(id) {
    const updateQuery = `
      UPDATE customer_reviews
      SET helpful_count = helpful_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  static async markUnhelpful(id) {
    const updateQuery = `
      UPDATE customer_reviews
      SET unhelpful_count = unhelpful_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking review as unhelpful:', error);
      throw error;
    }
  }
}

module.exports = ReviewsModel;
