# Support Tickets - Database SQL Reference

## Create Table

```sql
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
```

## Create Indexes

```sql
-- Customer lookup
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON support_tickets(customer_id);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);

-- Priority filtering
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);

-- Product relationship
CREATE INDEX IF NOT EXISTS idx_tickets_product_id ON support_tickets(product_id);

-- Date-based sorting and range queries
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at);
```

## Drop Table (if needed)

```sql
DROP TABLE IF EXISTS support_tickets CASCADE;
```

## Sample Data Inserts

```sql
-- Insert sample support ticket
INSERT INTO support_tickets (
    customer_id,
    subject,
    description,
    category,
    priority,
    product_id,
    order_id,
    attachments,
    status
) VALUES (
    1,
    'Login issue on mobile app',
    'I cannot login to the mobile app with my credentials. The app returns "Invalid credentials" error even though the password is correct.',
    'Technical Support',
    'High',
    5,
    'ORD-2025-001',
    '[]'::jsonb,
    'Open'
);

-- Insert sample ticket with attachment
INSERT INTO support_tickets (
    customer_id,
    subject,
    description,
    category,
    priority,
    product_id,
    attachments,
    status
) VALUES (
    2,
    'Payment processing error',
    'My payment was declined but I was still charged. Please help resolve this issue.',
    'Billing',
    'Critical',
    3,
    '[{
        "filename": "payment_receipt.pdf",
        "mimetype": "application/pdf",
        "size": 102400,
        "uploadedAt": "2025-01-06T10:30:00Z"
    }]'::jsonb,
    'In Progress'
);

-- Insert multiple tickets
INSERT INTO support_tickets (customer_id, subject, description, category, priority, status) VALUES
(3, 'Feature request: Dark mode', 'Please add a dark mode option to the app', 'Feature Request', 'Low', 'Open'),
(4, 'Pricing page error', 'The pricing page shows incorrect numbers', 'Bug', 'Medium', 'Open'),
(5, 'Account deletion request', 'I would like to delete my account and all personal data', 'Account Management', 'High', 'Open');
```

## Common Queries

### Get all open tickets
```sql
SELECT * FROM support_tickets 
WHERE status = 'Open' 
ORDER BY created_at DESC;
```

### Get customer's tickets
```sql
SELECT * FROM support_tickets 
WHERE customer_id = 1 
ORDER BY created_at DESC;
```

### Get high priority tickets
```sql
SELECT * FROM support_tickets 
WHERE priority = 'High' OR priority = 'Critical'
ORDER BY created_at DESC;
```

### Get tickets by category
```sql
SELECT * FROM support_tickets 
WHERE category = 'Bug' 
ORDER BY created_at DESC;
```

### Get tickets created in last 7 days
```sql
SELECT * FROM support_tickets 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Get ticket with attachment metadata
```sql
SELECT 
    id,
    customer_id,
    subject,
    attachments
FROM support_tickets 
WHERE jsonb_array_length(attachments) > 0
ORDER BY created_at DESC;
```

### Count tickets by status
```sql
SELECT 
    status,
    COUNT(*) as count
FROM support_tickets
GROUP BY status;
```

### Count tickets by priority
```sql
SELECT 
    priority,
    COUNT(*) as count
FROM support_tickets
GROUP BY priority;
```

### Count tickets by category
```sql
SELECT 
    category,
    COUNT(*) as count
FROM support_tickets
GROUP BY category;
```

### Get oldest unresolved tickets
```sql
SELECT * FROM support_tickets 
WHERE status IN ('Open', 'In Progress')
ORDER BY created_at ASC
LIMIT 10;
```

### Get tickets with multiple attachments
```sql
SELECT 
    id,
    subject,
    jsonb_array_length(attachments) as attachment_count
FROM support_tickets
WHERE jsonb_array_length(attachments) > 1
ORDER BY created_at DESC;
```

### Get tickets for a specific product
```sql
SELECT * FROM support_tickets 
WHERE product_id = 5
ORDER BY created_at DESC;
```

### Get tickets for a specific order
```sql
SELECT * FROM support_tickets 
WHERE order_id = 'ORD-2025-001'
ORDER BY created_at DESC;
```

### Update ticket status
```sql
UPDATE support_tickets 
SET status = 'Resolved', updated_at = NOW()
WHERE id = 1;
```

### Add information to existing ticket
```sql
UPDATE support_tickets 
SET description = 'Updated description about the issue'
WHERE id = 1;
```

### Delete ticket
```sql
DELETE FROM support_tickets 
WHERE id = 1;
```

## JSONB Attachment Queries

### Check if ticket has attachments
```sql
SELECT * FROM support_tickets 
WHERE attachments != '[]'::jsonb
ORDER BY created_at DESC;
```

### Get specific attachment from JSONB
```sql
SELECT 
    id,
    subject,
    attachments->0 as first_attachment
FROM support_tickets
WHERE jsonb_array_length(attachments) > 0;
```

### Search attachment filenames
```sql
SELECT * FROM support_tickets 
WHERE attachments @> '[{"filename": "error.png"}]'::jsonb
ORDER BY created_at DESC;
```

### Get total size of attachments per ticket
```sql
SELECT 
    id,
    subject,
    SUM(CAST(att->>'size' AS BIGINT)) as total_attachment_size
FROM support_tickets,
jsonb_array_elements(attachments) as att
WHERE jsonb_array_length(attachments) > 0
GROUP BY id, subject
ORDER BY total_attachment_size DESC;
```

## Performance Analysis

### Check index usage
```sql
SELECT 
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE relname = 'support_tickets'
ORDER BY idx_scan DESC;
```

### Check table size
```sql
SELECT 
    pg_size_pretty(pg_total_relation_size('support_tickets')) as size;
```

### Check index sizes
```sql
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
WHERE tablename = 'support_tickets';
```

### Check query plans
```sql
EXPLAIN ANALYZE
SELECT * FROM support_tickets 
WHERE customer_id = 1 
ORDER BY created_at DESC
LIMIT 10;
```

## Maintenance

### Vacuum (cleanup)
```sql
VACUUM ANALYZE support_tickets;
```

### Reindex
```sql
REINDEX TABLE support_tickets;
```

### Get table statistics
```sql
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_analyze
FROM pg_stat_user_tables
WHERE tablename = 'support_tickets';
```

## Constraints (Recommendations)

### Add status constraint
```sql
ALTER TABLE support_tickets 
ADD CONSTRAINT check_status 
CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed'));
```

### Add priority constraint
```sql
ALTER TABLE support_tickets 
ADD CONSTRAINT check_priority 
CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));
```

### Add foreign key constraints (if using related tables)
```sql
-- If you have a customers table
ALTER TABLE support_tickets
ADD CONSTRAINT fk_customer_id
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- If you have a products table
ALTER TABLE support_tickets
ADD CONSTRAINT fk_product_id
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
```

## Migration from Old tickets Table (if needed)

```sql
-- Create temporary table to backup old data
CREATE TABLE tickets_backup AS SELECT * FROM tickets;

-- Drop old foreign keys
ALTER TABLE IF EXISTS ticket_approvals 
DROP CONSTRAINT IF EXISTS fk_ticket_id CASCADE;

-- Drop old table
DROP TABLE IF EXISTS tickets CASCADE;

-- Old data is now in tickets_backup if needed for reference
```

## Notes

- BIGSERIAL is preferred over SERIAL for future scalability
- JSONB is used for attachments to maintain flexibility
- Indexes are created on all commonly queried fields
- DEFAULT values reduce the need for explicit NULL handling
- Timestamps are stored in UTC
- All character fields are VARCHAR/TEXT for flexibility
- NULL values are allowed for optional relationship fields
