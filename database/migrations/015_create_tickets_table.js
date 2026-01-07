const TicketsModel = require('../../models/Tickets');

/**
 * Migration: Create support_tickets table with indexes
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating support_tickets table...');
    await TicketsModel.createTable();

    // Create indexes for better query performance
    const { query } = require('../../config/database');
    
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON support_tickets(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_product_id ON support_tickets(product_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at)');

    console.log('✅ Support tickets table created with indexes');
  } catch (error) {
    console.error('❌ Error creating support_tickets table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop support_tickets table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping support_tickets table...');
    const { query } = require('../../config/database');
    
    await query('DROP TABLE IF EXISTS support_tickets CASCADE');
    console.log('✅ Support tickets table dropped');
  } catch (error) {
    console.error('❌ Error dropping support_tickets table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
