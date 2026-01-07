const { connectDB, query } = require('./config/database');

require('dotenv').config();

/**
 * Standalone Migration Script
 * Creates support_tickets table and migrates data from old tickets table
 * Usage: node migrate_tickets_only.js
 */

const migrateTicketsTable = async () => {
  try {
    console.log('🔗 Connecting to PostgreSQL database...');
    await connectDB();

    console.log('\n🔄 Starting migration...\n');

    // Step 1: Create support_tickets table
    console.log('📦 Step 1: Creating support_tickets table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS support_tickets (
        id BIGSERIAL PRIMARY KEY,
        customer_id BIGINT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
        product_id BIGINT NULL,
        order_id VARCHAR(100) NULL,
        attachments JSONB DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await query(createTableQuery);
    console.log('✅ support_tickets table created successfully\n');

    // Step 2: Create indexes
    console.log('📦 Step 2: Creating indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON support_tickets(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_product_id ON support_tickets(product_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at)');
    console.log('✅ Indexes created successfully\n');

    // Step 3: Check if old tickets table exists and migrate data
    console.log('📦 Step 3: Checking for old tickets table...');
    const tableCheckResult = await query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tickets'
      );
    `);

    if (!tableCheckResult.rows[0].exists) {
      console.log('ℹ️  Old tickets table does not exist, skipping data migration');
      console.log('\n✨ Migration completed successfully!\n');
      process.exit(0);
    }

    console.log('ℹ️  Old tickets table found, migrating data...\n');

    // Step 4: Migrate data
    console.log('📦 Step 4: Migrating data from tickets to support_tickets...');
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
        CAST(id AS BIGINT) as customer_id,
        COALESCE(trace_no, reference_no, 'Ticket #' || id) as subject,
        'Location: ' || location || ' | Date: ' || date || ' | Time: ' || time || ' | Terminal: ' || terminal_id || ' | Details: ' || scanned_data::text as description,
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
    console.log('✅ Data migration completed successfully\n');

    // Step 5: Get count of migrated records
    console.log('📦 Step 5: Verifying migrated data...');
    const countResult = await query('SELECT COUNT(*) FROM support_tickets');
    const migratedCount = countResult.rows[0].count;
    console.log(`📊 Total records migrated: ${migratedCount}\n`);

    console.log('✨ All migration steps completed successfully!');
    console.log('\nℹ️  You can now optionally drop the old tickets table with:');
    console.log('   DROP TABLE IF EXISTS tickets CASCADE;\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

migrateTicketsTable();
