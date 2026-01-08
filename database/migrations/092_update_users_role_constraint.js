/**
 * Migration: Update users table to allow dynamic role names
 * Remove the CHECK constraint that limits roles to only 'user', 'moderator', 'admin'
 */
const up = async () => {
  try {
    console.log('Updating users table role constraint...');
    const { query } = require('../../config/database');

    // Drop the existing CHECK constraint
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');

    // Add a new CHECK constraint that allows any non-empty string
    await query('ALTER TABLE users ADD CONSTRAINT users_role_check_new CHECK (role IS NOT NULL AND length(trim(role)) > 0)');

    console.log('✅ Users table role constraint updated successfully');
  } catch (error) {
    console.error('❌ Error updating users table role constraint:', error.message);
    throw error;
  }
};

/**
 * Rollback: Restore the original CHECK constraint
 */
const down = async () => {
  try {
    console.log('Reverting users table role constraint...');
    const { query } = require('../../config/database');

    // Drop the new constraint
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check_new');

    // Restore the original constraint
    await query('ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (\'user\', \'moderator\', \'admin\'))');

    console.log('✅ Users table role constraint reverted');
  } catch (error) {
    console.error('❌ Error reverting users table role constraint:', error.message);
    throw error;
  }
};

module.exports = { up, down };