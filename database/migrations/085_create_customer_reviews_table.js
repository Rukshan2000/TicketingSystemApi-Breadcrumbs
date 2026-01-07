const ReviewsModel = require('../../models/Reviews');

/**
 * Migration: Create customer_reviews table for ticket reviews
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating customer_reviews table...');
    await ReviewsModel.createTable();

    // Create indexes for better query performance
    const { query } = require('../../config/database');
    
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_ticket_id ON customer_reviews(ticket_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON customer_reviews(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON customer_reviews(rating)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_status ON customer_reviews(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON customer_reviews(created_at)');

    console.log('✅ Customer reviews table created with indexes');
  } catch (error) {
    console.error('❌ Error creating customer_reviews table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop customer_reviews table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping customer_reviews table...');
    const { query } = require('../../config/database');
    
    await query('DROP TABLE IF EXISTS customer_reviews CASCADE');
    console.log('✅ Customer reviews table dropped');
  } catch (error) {
    console.error('❌ Error dropping customer_reviews table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
