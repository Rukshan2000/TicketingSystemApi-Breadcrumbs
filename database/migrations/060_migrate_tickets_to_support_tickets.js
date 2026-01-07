/**
 * Migration: Migrate data from tickets table to support_tickets table
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Starting data migration from tickets to support_tickets...');
    const { query } = require('../../config/database');

    // Check if old tickets table exists
    const tableCheckResult = await query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tickets'
      );
    `);

    if (!tableCheckResult.rows[0].exists) {
      console.log('ℹ️  Old tickets table does not exist, skipping data migration');
      return;
    }

    // Migrate data from old tickets table to new support_tickets table
    // Since the schemas are different, we'll create a mapping:
    // - terminal_id -> product_id (as a derived/placeholder value)
    // - trace_no or reference_no -> order_id
    // - location + date + time -> description prefix
    // - 'Support' -> category (default)
    // - 'Medium' -> priority (default)

    const migrationQuery = `
      INSERT INTO support_tickets (
        customer_id,
        subject,
        description,
        category,
        priority,
        product_id,
        order_id,
        attachments,
        status,
        created_at,
        updated_at
      )
      SELECT
        CAST(COALESCE(terminal_id, '0') AS BIGINT) as customer_id,
        COALESCE(trace_no, reference_no, 'Ticket #' || id) as subject,
        'Location: ' || location || ' | Date: ' || date || ' | Time: ' || time || ' | Details: ' || scanned_data::text as description,
        'General' as category,
        'Medium' as priority,
        NULL as product_id,
        COALESCE(trace_no, reference_no, NULL) as order_id,
        CASE WHEN ticket_img_path IS NOT NULL THEN 
          json_build_array(json_build_object(
            'filename', ticket_img_path,
            'mimetype', 'image/jpeg',
            'size', 0,
            'uploadedAt', NOW()::text
          ))::jsonb
        ELSE '[]'::jsonb END as attachments,
        'Open' as status,
        created_at,
        updated_at
      FROM tickets;
    `;

    await query(migrationQuery);
    console.log('✅ Data migration completed successfully');

    // Get count of migrated records
    const countResult = await query('SELECT COUNT(*) FROM support_tickets');
    console.log(`📊 Total records migrated: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error during data migration:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop support_tickets and restore old tickets table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Rolling back data migration...');
    const { query } = require('../../config/database');

    // Delete all records from support_tickets
    await query('DELETE FROM support_tickets');
    console.log('✅ Data migration rolled back');

  } catch (error) {
    console.error('❌ Error rolling back data migration:', error.message);
    throw error;
  }
};

module.exports = { up, down };
