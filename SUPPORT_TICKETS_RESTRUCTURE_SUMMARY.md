# Support Tickets System - Complete Restructure Summary

## Overview
The support tickets system has been completely restructured to match a customer support ticketing system model instead of the previous retail POS ticket model.

## Changes Made

### 1. Database Migration (015_create_tickets_table.js)
**Changed:** Table creation and indexing strategy

**Old Schema:**
- Retail-focused fields: `date`, `time`, `terminal_id`, `location`, `no_tickets`, `total_amount`, `trace_no`, `reference_no`, `ticket_amount_pp`, `ticket_img_path`, `scanned_data`
- Simple SERIAL ID
- Limited indexing on retail-specific fields

**New Schema:**
```sql
CREATE TABLE support_tickets (
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

**New Indexes:**
- `idx_tickets_customer_id` - For customer lookup
- `idx_tickets_status` - For status filtering
- `idx_tickets_category` - For category filtering
- `idx_tickets_priority` - For priority filtering
- `idx_tickets_product_id` - For product-related queries
- `idx_tickets_created_at` - For date-based sorting

---

### 2. Model (Tickets.js)
**Changed:** Complete overhaul of data operations

**Removed Methods:**
- `getByTraceNo()` - No longer applicable
- Removed reference to `scanned_data` JSON handling

**New Methods:**
- `getByCustomerId(customerId)` - Get all tickets for a customer
- `getByStatus(status, limit, offset)` - Filter by status
- `getByCategory(category, limit, offset)` - Filter by category
- `getByPriority(priority, limit, offset)` - Filter by priority
- `countByStatus(status)` - Count tickets by status
- `search(filters, limit, offset)` - Advanced multi-filter search

**Updated Methods:**
- `create()` - Now accepts customer_id, subject, description, category, priority, product_id, order_id, attachments, status
- `update()` - Changed JSON handling from `scanned_data` to `attachments`
- `count()` - Query updated to use `support_tickets` table name

---

### 3. Controller (ticketsController.js)
**Changed:** All request handlers updated for support ticket operations

**Removed Methods:**
- `getTicketByTraceNo()` - No longer needed
- `createTicketWithImage()` - Replaced with attachment management

**New Methods:**
- `getTicketsByCustomerId()` - Get all tickets for a customer
- `getTicketsByStatus()` - Filter and paginate by status
- `getTicketsByCategory()` - Filter and paginate by category
- `getTicketsByPriority()` - Filter and paginate by priority
- `searchTickets()` - Advanced search with multiple filters
- `addAttachment()` - Add file attachment to ticket
- `removeAttachment()` - Remove file attachment from ticket

**Updated Methods:**
- `createTicket()` - Validates: customer_id, subject, description, category (priority, product_id, order_id, attachments, status optional)
- `updateTicket()` - Updated response handling
- All methods updated for new schema fields

---

### 4. Routes (routes/tickets.js)
**Changed:** All route definitions updated

**Old Routes:**
```
POST   /with-image                 - createTicketWithImage
POST   /                           - createTicket
GET    /                           - getAllTickets
GET    /count                      - getTicketCount
GET    /search/date-range          - searchByDateRange
GET    /trace/:traceNo             - getTicketByTraceNo
GET    /:id                        - getTicketById
PUT    /:id                        - updateTicket
DELETE /:id                        - deleteTicket
```

**New Routes:**
```
POST   /                           - createTicket
GET    /                           - getAllTickets
GET    /count                      - getTicketCount
GET    /search/filters             - searchTickets (multi-filter)
GET    /search/date-range          - searchByDateRange
GET    /customer/:customerId       - getTicketsByCustomerId
GET    /status/:status             - getTicketsByStatus
GET    /category/:category         - getTicketsByCategory
GET    /priority/:priority         - getTicketsByPriority
GET    /:id                        - getTicketById
PUT    /:id                        - updateTicket
DELETE /:id                        - deleteTicket
POST   /:id/attachments            - addAttachment
DELETE /:id/attachments/:index     - removeAttachment
```

---

## Field Mapping

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| date + time | created_at | Combined into single timestamp |
| terminal_id | - | Removed (not applicable) |
| location | - | Removed (not applicable) |
| no_tickets | - | Removed (not applicable) |
| total_amount | - | Removed (not applicable) |
| trace_no | - | Removed (not applicable) |
| reference_no | - | Removed (not applicable) |
| ticket_amount_pp | - | Removed (not applicable) |
| ticket_img_path | attachments | Changed to JSONB metadata array |
| scanned_data | - | Removed (not applicable) |
| - | customer_id | NEW: Customer identifier |
| - | subject | NEW: Ticket title |
| - | description | NEW: Detailed description |
| - | category | NEW: Ticket categorization |
| - | priority | NEW: Priority level (Medium default) |
| - | product_id | NEW: Related product |
| - | order_id | NEW: Related order |
| - | status | NEW: Ticket status (Open default) |

---

## Key Features of New System

### 1. Customer-Centric
- Tied to `customer_id` for customer relationship management
- Can retrieve all tickets for a specific customer
- Supports multi-ticket management per customer

### 2. Status Tracking
- Multiple status values: Open, In Progress, Resolved, Closed
- Easy filtering and reporting by status
- Status-based queries with pagination

### 3. Categorization & Prioritization
- Flexible category field for ticket types (Bug, Feature Request, Billing, etc.)
- Priority levels: Low, Medium, High, Critical
- Can filter/search by both dimensions

### 4. Attachment Management
- JSONB array-based attachment metadata storage
- Supports adding/removing attachments without full table updates
- Tracks filename, MIME type, size, and upload timestamp

### 5. Related Data Links
- `product_id` - Link to products
- `order_id` - Link to customer orders
- Enables cross-referencing and comprehensive support history

### 6. Advanced Search
- Multi-filter search supporting any combination of: customer_id, status, category, priority, product_id
- Date range search
- Pagination support on all filtered queries

---

## Migration Steps

### 1. Database Migration
```bash
npm run migrate
```

This will:
- Drop old `tickets` table (if rollback was used)
- Create new `support_tickets` table
- Create all necessary indexes

### 2. Data Transformation (If needed)
If you have old data to migrate, create a custom seeder/migration script.

### 3. Update Frontend/API Consumers
Update any code consuming the old routes:
- Remove references to `/with-image` endpoint
- Update filter endpoints to use new paths
- Update request/response body handling

---

## Example Usage

### Create a Support Ticket
```json
POST /api/tickets
{
  "customer_id": 1,
  "subject": "Cannot reset password",
  "description": "I'm getting an error when trying to reset my password",
  "category": "Technical Support",
  "priority": "High",
  "product_id": 5,
  "order_id": "ORD-2025-001"
}
```

### Get Customer's Tickets
```
GET /api/tickets/customer/1
```

### Filter Open Bugs
```
GET /api/tickets/search/filters?status=Open&category=Bug&limit=20
```

### Add Attachment
```
POST /api/tickets/1/attachments
(multipart/form-data with file)
```

### Update Ticket Status
```json
PUT /api/tickets/1
{
  "status": "Resolved",
  "priority": "Medium"
}
```

---

## Backward Compatibility

⚠️ **BREAKING CHANGES**: This is a complete restructure and is **NOT backward compatible** with the old retail ticket system.

The old routes and API are completely replaced. Any clients using the old system must be updated.

---

## Documentation Files

- `SUPPORT_TICKETS_API_GUIDE.md` - Complete API documentation with examples
- This file - Implementation summary and changes

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Can create new tickets with required fields
- [ ] Can retrieve tickets by ID
- [ ] Can filter by customer_id
- [ ] Can filter by status
- [ ] Can filter by category
- [ ] Can filter by priority
- [ ] Can update ticket status
- [ ] Can add attachments
- [ ] Can remove attachments
- [ ] Advanced search with multiple filters works
- [ ] Date range search works
- [ ] Pagination works on all list endpoints
- [ ] Count endpoints return correct values

---

## Performance Considerations

1. **BIGSERIAL for ID**: Supports much larger datasets than SERIAL
2. **Strategic Indexes**: All commonly filtered fields are indexed
3. **JSONB Attachments**: Efficient for sparse, optional data
4. **Pagination**: Implemented on all list endpoints to prevent memory issues

---

## Future Enhancements

1. Add attachment file storage integration (S3, local filesystem)
2. Add workflow/approval system for tickets
3. Add SLA tracking and escalation
4. Add internal notes/comments on tickets
5. Add ticket templates and automation
6. Add email notifications
7. Add ticket assignment system
8. Add customer portal for ticket creation and tracking
