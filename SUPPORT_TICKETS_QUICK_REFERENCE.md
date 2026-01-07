# Support Tickets API - Quick Reference

## Database Table
```sql
support_tickets (
  id BIGSERIAL,
  customer_id BIGINT,
  subject VARCHAR,
  description TEXT,
  category VARCHAR,
  priority VARCHAR (default: Medium),
  product_id BIGINT,
  order_id VARCHAR,
  attachments JSONB,
  status VARCHAR (default: Open),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Create Ticket
```bash
POST /api/tickets
{
  "customer_id": 1,
  "subject": "Issue title",
  "description": "Detailed description",
  "category": "Bug",
  "priority": "High",
  "product_id": 5,
  "order_id": "ORD-123"
}
```

## Get Tickets
```bash
GET /api/tickets                              # All tickets (paginated)
GET /api/tickets/:id                         # By ID
GET /api/tickets/customer/:customerId        # By customer
GET /api/tickets/status/:status              # By status
GET /api/tickets/category/:category          # By category
GET /api/tickets/priority/:priority          # By priority
GET /api/tickets/count                       # Total count
```

## Search & Filter
```bash
# Multi-filter search
GET /api/tickets/search/filters?customer_id=1&status=Open&category=Bug&priority=High

# Date range search
GET /api/tickets/search/date-range?startDate=2025-01-01&endDate=2025-01-31
```

## Update Ticket
```bash
PUT /api/tickets/:id
{
  "status": "In Progress",
  "priority": "Critical",
  "subject": "Updated title",
  "description": "Updated details"
}
```

## Attachments
```bash
POST /api/tickets/:id/attachments -F "attachment=@file.pdf"   # Add
DELETE /api/tickets/:id/attachments/:index                     # Remove
```

## Delete Ticket
```bash
DELETE /api/tickets/:id
```

## Query Parameters
- `limit` - Results per page (default: 10)
- `offset` - Skip N results (default: 0)

## Status Values
- Open
- In Progress
- Resolved
- Closed

## Priority Levels
- Low
- Medium (default)
- High
- Critical

## Response Format
```json
{
  "success": true,
  "data": {...},
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 42
  }
}
```

## Error Format
```json
{
  "error": "Error message"
}
```

## Files Changed
1. `/database/migrations/015_create_tickets_table.js` - Migration
2. `/models/Tickets.js` - Model with new methods
3. `/controllers/ticketsController.js` - Controller with new endpoints
4. `/routes/tickets.js` - Updated route definitions

## Key Model Methods
- `create(ticket)` - Create new ticket
- `getById(id)` - Get ticket by ID
- `getByCustomerId(customerId)` - Get customer's tickets
- `getByStatus(status, limit, offset)` - Filter by status
- `getByCategory(category, limit, offset)` - Filter by category
- `getByPriority(priority, limit, offset)` - Filter by priority
- `search(filters, limit, offset)` - Advanced search
- `update(id, updates)` - Update ticket
- `delete(id)` - Delete ticket
- `count()` - Total count
- `countByStatus(status)` - Count by status
- `searchByDateRange(startDate, endDate)` - Date search

## Attachment Structure
```json
{
  "attachments": [
    {
      "filename": "document.pdf",
      "mimetype": "application/pdf",
      "size": 2048576,
      "uploadedAt": "2025-01-06T10:30:00Z"
    }
  ]
}
```

## Common Curl Examples

### Create ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"subject":"Title","description":"Details","category":"Bug"}'
```

### Get all open tickets
```bash
curl http://localhost:5000/api/tickets/status/Open?limit=20
```

### Update status
```bash
curl -X PUT http://localhost:5000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"Resolved"}'
```

### Add attachment
```bash
curl -X POST http://localhost:5000/api/tickets/1/attachments \
  -F "attachment=@file.pdf"
```

### Search by filters
```bash
curl "http://localhost:5000/api/tickets/search/filters?customer_id=1&status=Open&priority=High"
```
