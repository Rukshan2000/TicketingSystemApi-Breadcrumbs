/**
 * Migration: Change product_id column type from BIGINT to VARCHAR
 * This allows string-based product IDs like "TKT-1767708902684-ZBEJ1"
 */

const up = async () => {
  try {
    console.log('Changing product_id column type to VARCHAR...');
    const { query } = require('../../config/database');

    // Alter column type from BIGINT to VARCHAR
    await query(`
      ALTER TABLE support_tickets 
      ALTER COLUMN product_id TYPE VARCHAR(100) USING product_id::VARCHAR;
    `);

    console.log('✅ product_id column changed to VARCHAR(100)');
  } catch (error) {
    console.error('❌ Error changing product_id column type:', error.message);
    throw error;
  }
};

/**
 * Rollback: Change product_id back to BIGINT
 */
const down = async () => {
  try {
    console.log('Reverting product_id column type to BIGINT...');
    const { query } = require('../../config/database');

    await query(`
      ALTER TABLE support_tickets 
      ALTER COLUMN product_id TYPE BIGINT USING NULLIF(product_id, '')::BIGINT;
    `);

    console.log('✅ product_id column reverted to BIGINT');
  } catch (error) {
    console.error('❌ Error reverting product_id column type:', error.message);
    throw error;
  }
};

module.exports = { up, down };
