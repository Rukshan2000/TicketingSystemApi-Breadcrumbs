/**
 * Migration: Update systems table - replace delivered_date with status
 * Run with: node -e "const { connectDB } = require('./config/database'); const migration = require('./database/migrations/091_update_systems_table.js'); (async () => { await connectDB(); console.log('Running systems table update migration...'); await migration.up(); console.log('Migration completed successfully!'); })();"
 */
const up = async () => {
  try {
    console.log('Updating systems table...');
    const { query } = require('../../config/database');

    // Drop the old index
    await query('DROP INDEX IF EXISTS idx_systems_delivered_date');

    // Add the new status column
    await query('ALTER TABLE systems ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'pending\'');

    // Drop the old delivered_date column
    await query('ALTER TABLE systems DROP COLUMN IF EXISTS delivered_date');

    // Create index for the new status column
    await query('CREATE INDEX IF NOT EXISTS idx_systems_status ON systems(status)');

    console.log('✅ Systems table updated successfully');
  } catch (error) {
    console.error('❌ Error updating systems table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Revert systems table changes
 * Run with: node -e "const migration = require('./database/migrations/091_update_systems_table.js'); migration.down();"
 */
const down = async () => {
  try {
    console.log('Reverting systems table changes...');
    const { query } = require('../../config/database');

    // Drop the new index
    await query('DROP INDEX IF EXISTS idx_systems_status');

    // Add back the delivered_date column
    await query('ALTER TABLE systems ADD COLUMN IF NOT EXISTS delivered_date TIMESTAMP');

    // Drop the status column
    await query('ALTER TABLE systems DROP COLUMN IF EXISTS status');

    // Recreate the old index
    await query('CREATE INDEX IF NOT EXISTS idx_systems_delivered_date ON systems(delivered_date)');

    console.log('✅ Systems table changes reverted');
  } catch (error) {
    console.error('❌ Error reverting systems table changes:', error.message);
    throw error;
  }
};

module.exports = { up, down };