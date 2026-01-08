const SystemsModel = require('../../models/Systems');

/**
 * Migration: Create systems table
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating systems table...');
    await SystemsModel.createTable();

    // Create indexes for better query performance
    const { query } = require('../../config/database');

    await query('CREATE INDEX IF NOT EXISTS idx_systems_system_name ON systems(system_name)');
    await query('CREATE INDEX IF NOT EXISTS idx_systems_status ON systems(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_systems_created_at ON systems(created_at)');

    console.log('✅ Systems table created with indexes');
  } catch (error) {
    console.error('❌ Error creating systems table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop systems table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping systems table...');
    const { query } = require('../../config/database');

    await query('DROP TABLE IF EXISTS systems CASCADE');
    console.log('✅ Systems table dropped');
  } catch (error) {
    console.error('❌ Error dropping systems table:', error.message);
    throw error;
  }
};

module.exports = { up, down };