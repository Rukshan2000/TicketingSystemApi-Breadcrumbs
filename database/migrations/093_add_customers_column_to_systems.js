/**
 * Migration: Add customers column to systems table
 */
const up = async () => {
  try {
    console.log('Adding customers column to systems table...');
    const { query } = require('../../config/database');

    // Add the customers column
    await query('ALTER TABLE systems ADD COLUMN IF NOT EXISTS customers JSONB');

    console.log('✅ Customers column added to systems table successfully');
  } catch (error) {
    console.error('❌ Error adding customers column to systems table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Remove customers column from systems table
 */
const down = async () => {
  try {
    console.log('Removing customers column from systems table...');
    const { query } = require('../../config/database');

    // Drop the customers column
    await query('ALTER TABLE systems DROP COLUMN IF EXISTS customers');

    console.log('✅ Customers column removed from systems table');
  } catch (error) {
    console.error('❌ Error removing customers column from systems table:', error.message);
    throw error;
  }
};

module.exports = { up, down };