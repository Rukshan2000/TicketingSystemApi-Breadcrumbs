/**
 * Migration: Add workflow columns to support_tickets table
 * Adds approval_status and workflow_id columns for workflow tracking
 */

const up = async () => {
  try {
    console.log('Adding workflow columns to support_tickets table...');
    const { query } = require('../../config/database');

    // Add workflow_id column
    await query(`
      ALTER TABLE support_tickets
      ADD COLUMN IF NOT EXISTS workflow_id BIGINT NULL,
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'NONE',
      ADD COLUMN IF NOT EXISTS current_node_order INTEGER DEFAULT 0;
    `);

    // Create indexes for workflow queries
    await query('CREATE INDEX IF NOT EXISTS idx_support_tickets_workflow_id ON support_tickets(workflow_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_support_tickets_approval_status ON support_tickets(approval_status)');
    await query('CREATE INDEX IF NOT EXISTS idx_support_tickets_current_node_order ON support_tickets(current_node_order)');

    console.log('✅ Workflow columns added to support_tickets table');
  } catch (error) {
    console.error('❌ Error adding workflow columns:', error.message);
    throw error;
  }
};

/**
 * Rollback: Remove workflow columns from support_tickets
 */
const down = async () => {
  try {
    console.log('Removing workflow columns from support_tickets table...');
    const { query } = require('../../config/database');

    await query(`
      ALTER TABLE support_tickets
      DROP COLUMN IF EXISTS workflow_id,
      DROP COLUMN IF EXISTS approval_status,
      DROP COLUMN IF EXISTS current_node_order;
    `);

    console.log('✅ Workflow columns removed from support_tickets');
  } catch (error) {
    console.error('❌ Error removing workflow columns:', error.message);
    throw error;
  }
};

module.exports = { up, down };
