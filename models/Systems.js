const { query } = require('../config/database');

class SystemsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS systems (
        id BIGSERIAL PRIMARY KEY,
        system_name VARCHAR(255) NOT NULL,
        system_description TEXT,
        status VARCHAR(50) DEFAULT 'inactive',
        responsible_person JSONB,
        customers JSONB,
        system_documentation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Systems table created successfully');
    } catch (error) {
      console.error('Error creating systems table:', error);
      throw error;
    }
  }

  static async create(system) {
    const {
      system_name,
      system_description = null,
      status = 'inactive',
      responsible_person = null,
      customers = null,
      system_documentation = null,
    } = system;

    const insertQuery = `
      INSERT INTO systems (
        system_name,
        system_description,
        status,
        responsible_person,
        customers,
        system_documentation
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    try {
      const result = await query(insertQuery, [
        system_name,
        system_description,
        status,
        JSON.stringify(responsible_person),
        JSON.stringify(customers),
        system_documentation,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating system:', error);
      throw error;
    }
  }

  static async findAll() {
    const selectQuery = `
      SELECT * FROM systems ORDER BY created_at DESC;
    `;

    try {
      const result = await query(selectQuery);
      return result.rows;
    } catch (error) {
      console.error('Error fetching systems:', error);
      throw error;
    }
  }

  static async findById(id) {
    const selectQuery = `
      SELECT * FROM systems WHERE id = $1;
    `;

    try {
      const result = await query(selectQuery, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching system:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const {
      system_name,
      system_description,
      status,
      responsible_person,
      customers,
      system_documentation,
    } = updates;

    const updateQuery = `
      UPDATE systems
      SET
        system_name = COALESCE($1, system_name),
        system_description = COALESCE($2, system_description),
        status = COALESCE($3, status),
        responsible_person = COALESCE($4, responsible_person),
        customers = COALESCE($5, customers),
        system_documentation = COALESCE($6, system_documentation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [
        system_name,
        system_description,
        status,
        responsible_person ? JSON.stringify(responsible_person) : null,
        customers ? JSON.stringify(customers) : null,
        system_documentation,
        id,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating system:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = `
      DELETE FROM systems WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(deleteQuery, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting system:', error);
      throw error;
    }
  }
}

module.exports = SystemsModel;