const { query } = require('../../config/database');

/**
 * Migration: Fix reprint_requests foreign key to reference support_tickets instead of tickets
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Fixing reprint_requests foreign key reference...');

    // Drop the old foreign key constraint
    await query(`
      ALTER TABLE reprint_requests 
      DROP CONSTRAINT IF EXISTS reprint_requests_ticket_id_fkey
    `);

    // Add the new foreign key pointing to support_tickets
    await query(`
      ALTER TABLE reprint_requests 
      ADD CONSTRAINT reprint_requests_ticket_id_fkey 
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
    `);

    console.log('✅ Foreign key fixed: reprint_requests now references support_tickets');
  } catch (error) {
    console.error('❌ Error fixing reprint_requests foreign key:', error.message);
    throw error;
  }
};

/**
 * Rollback: Revert to old foreign key pointing to tickets table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Reverting reprint_requests foreign key...');

    // Drop the new foreign key constraint
    await query(`
      ALTER TABLE reprint_requests 
      DROP CONSTRAINT IF EXISTS reprint_requests_ticket_id_fkey
    `);

    // Add back the old foreign key pointing to tickets
    await query(`
      ALTER TABLE reprint_requests 
      ADD CONSTRAINT reprint_requests_ticket_id_fkey 
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    `);

    console.log('✅ Foreign key reverted: reprint_requests references tickets again');
  } catch (error) {
    console.error('❌ Error reverting reprint_requests foreign key:', error.message);
    throw error;
  }
};

module.exports = { up, down };
