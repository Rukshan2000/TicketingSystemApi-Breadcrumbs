# Support Tickets API Guide

## Overview
The Support Tickets API handles customer support tickets with comprehensive features including status tracking, categorization, prioritization, and attachment management.

## Database Schema

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

## Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | BIGSERIAL | Auto | - | Unique ticket identifier |
| customer_id | BIGINT | Yes | - | ID of the customer creating the ticket |
| subject | VARCHAR(255) | Yes | - | Brief title of the ticket |
| description | TEXT | Yes | - | Detailed description of the issue |
| category | VARCHAR(50) | Yes | - | Ticket category (e.g., Bug, Feature Request, General) |
| priority | VARCHAR(20) | No | 'Medium' | Priority level (Low, Medium, High, Critical) |
| product_id | BIGINT | No | NULL | Related product ID |
| order_id | VARCHAR(100) | No | NULL | Related order ID |
| attachments | JSONB | No | '[]' | JSON array of attachment metadata |
| status | VARCHAR(20) | No | 'Open' | Ticket status (Open, In Progress, Resolved, Closed) |
| created_at | TIMESTAMP | Auto | CURRENT_TIMESTAMP | Ticket creation timestamp |
| updated_at | TIMESTAMP | Auto | CURRENT_TIMESTAMP | Last update timestamp |

## Attachment Structure

Attachments are stored as JSONB array with the following structure:

```json
{
  "attachments": [
    {
      "filename": "document.pdf",
      "mimetype": "application/pdf",
      "size": 2048576,
      "uploadedAt": "2025-01-06T10:30:00.000Z"
    }
  ]
}
```

## API Endpoints

### 1. Create a New Ticket
**POST** `/api/tickets`

#### Request Body
```json
{
  "customer_id": 1,
  "subject": "Login issue on mobile app",
  "description": "I cannot login to the mobile app with my credentials",
  "category": "Bug",
  "priority": "High",
  "product_id": 5,
  "order_id": "ORD-12345",
  "attachments": [],
  "status": "Open"
}
```

#### Required Fields
- `customer_id` (number): ID of the customer
- `subject` (string): Ticket subject/title
- `description` (string): Detailed description
- `category` (string): Ticket category

#### Optional Fields
- `priority` (string): Low, Medium (default), High, Critical
- `product_id` (number): Related product ID
- `order_id` (string): Related order ID
- `attachments` (array): Initial attachments (usually empty)
- `status` (string): Open (default), In Progress, Resolved, Closed

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "subject": "Login issue on mobile app",
    "description": "I cannot login to the mobile app with my credentials",
    "category": "Bug",
    "priority": "High",
    "product_id": 5,
    "order_id": "ORD-12345",
    "attachments": [],
    "status": "Open",
    "created_at": "2025-01-06T10:30:00Z",
    "updated_at": "2025-01-06T10:30:00Z"
  }
}
```

---

### 2. Get All Tickets
**GET** `/api/tickets?limit=10&offset=0`

#### Query Parameters
- `limit` (number, default: 10): Number of tickets per page
- `offset` (number, default: 0): Number of tickets to skip

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": 1,
      "subject": "Login issue",
      "description": "Cannot login to the app",
      "category": "Bug",
      "priority": "High",
      "product_id": 5,
      "order_id": "ORD-12345",
      "attachments": [],
      "status": "Open",
      "created_at": "2025-01-06T10:30:00Z",
      "updated_at": "2025-01-06T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 42
  }
}
```

---

### 3. Get Ticket by ID
**GET** `/api/tickets/:id`

#### Parameters
- `id` (number): Ticket ID

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "subject": "Login issue on mobile app",
    "description": "I cannot login to the mobile app with my credentials",
    "category": "Bug",
    "priority": "High",
    "product_id": 5,
    "order_id": "ORD-12345",
    "attachments": [],
    "status": "Open",
    "created_at": "2025-01-06T10:30:00Z",
    "updated_at": "2025-01-06T10:30:00Z"
  }
}
```

#### Response (404 Not Found)
```json
{
  "error": "Ticket not found"
}
```

---

### 4. Get Tickets by Customer ID
**GET** `/api/tickets/customer/:customerId`

#### Parameters
- `customerId` (number): Customer ID

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": 1,
      "subject": "Login issue",
      "description": "Cannot login to the app",
      "category": "Bug",
      "priority": "High",
      "product_id": 5,
      "order_id": "ORD-12345",
      "attachments": [],
      "status": "Open",
      "created_at": "2025-01-06T10:30:00Z",
      "updated_at": "2025-01-06T10:30:00Z"
    }
  ]
}
```

---

### 5. Get Tickets by Status
**GET** `/api/tickets/status/:status?limit=10&offset=0`

#### Parameters
- `status` (string): Ticket status (Open, In Progress, Resolved, Closed)

#### Query Parameters
- `limit` (number, default: 10): Number of tickets per page
- `offset` (number, default: 0): Number of tickets to skip

#### Response (200 OK)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 15
  }
}
```

---

### 6. Get Tickets by Category
**GET** `/api/tickets/category/:category?limit=10&offset=0`

#### Parameters
- `category` (string): Ticket category

#### Query Parameters
- `limit` (number, default: 10): Number of tickets per page
- `offset` (number, default: 0): Number of tickets to skip

#### Response (200 OK)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 8
  }
}
```

---

### 7. Get Tickets by Priority
**GET** `/api/tickets/priority/:priority?limit=10&offset=0`

#### Parameters
- `priority` (string): Priority level (Low, Medium, High, Critical)

#### Query Parameters
- `limit` (number, default: 10): Number of tickets per page
- `offset` (number, default: 0): Number of tickets to skip

#### Response (200 OK)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 5
  }
}
```

---

### 8. Search Tickets by Filters
**GET** `/api/tickets/search/filters?customer_id=1&status=Open&category=Bug&priority=High&product_id=5&limit=10&offset=0`

#### Query Parameters
- `customer_id` (number, optional): Filter by customer ID
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category
- `priority` (string, optional): Filter by priority
- `product_id` (number, optional): Filter by product ID
- `limit` (number, default: 10): Number of tickets per page
- `offset` (number, default: 0): Number of tickets to skip

#### Response (200 OK)
```json
{
  "success": true,
  "data": [...]
}
```

---

### 9. Search by Date Range
**GET** `/api/tickets/search/date-range?startDate=2025-01-01&endDate=2025-01-31`

#### Query Parameters
- `startDate` (string): Start date (ISO 8601 format)
- `endDate` (string): End date (ISO 8601 format)

#### Response (200 OK)
```json
{
  "success": true,
  "data": [...]
}
```

---

### 10. Update Ticket
**PUT** `/api/tickets/:id`

#### Parameters
- `id` (number): Ticket ID

#### Request Body
```json
{
  "status": "In Progress",
  "priority": "Critical",
  "subject": "Updated subject",
  "description": "Updated description"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "subject": "Updated subject",
    "description": "Updated description",
    "category": "Bug",
    "priority": "Critical",
    "product_id": 5,
    "order_id": "ORD-12345",
    "attachments": [],
    "status": "In Progress",
    "created_at": "2025-01-06T10:30:00Z",
    "updated_at": "2025-01-06T11:45:00Z"
  }
}
```

---

### 11. Delete Ticket
**DELETE** `/api/tickets/:id`

#### Parameters
- `id` (number): Ticket ID

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

#### Response (404 Not Found)
```json
{
  "error": "Ticket not found"
}
```

---

### 12. Get Ticket Count
**GET** `/api/tickets/count`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "count": 42
  }
}
```

---

### 13. Add Attachment to Ticket
**POST** `/api/tickets/:id/attachments`

#### Parameters
- `id` (number): Ticket ID

#### Request
- Content-Type: `multipart/form-data`
- Body: Single file field named `attachment`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "subject": "Login issue",
    "description": "Cannot login to the app",
    "category": "Bug",
    "priority": "High",
    "product_id": 5,
    "order_id": "ORD-12345",
    "attachments": [
      {
        "filename": "error_screenshot.png",
        "mimetype": "image/png",
        "size": 524288,
        "uploadedAt": "2025-01-06T11:00:00Z"
      }
    ],
    "status": "Open",
    "created_at": "2025-01-06T10:30:00Z",
    "updated_at": "2025-01-06T11:00:00Z"
  }
}
```

---

### 14. Remove Attachment from Ticket
**DELETE** `/api/tickets/:id/attachments/:attachmentIndex`

#### Parameters
- `id` (number): Ticket ID
- `attachmentIndex` (number): Index of attachment to remove (0-based)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "subject": "Login issue",
    "description": "Cannot login to the app",
    "category": "Bug",
    "priority": "High",
    "product_id": 5,
    "order_id": "ORD-12345",
    "attachments": [],
    "status": "Open",
    "created_at": "2025-01-06T10:30:00Z",
    "updated_at": "2025-01-06T11:05:00Z"
  }
}
```

---

## Common Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters or missing required fields |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error occurred |

## Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

## Usage Examples

### Create a Support Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "subject": "Payment processing issue",
    "description": "My payment was declined but was still charged",
    "category": "Billing",
    "priority": "High",
    "product_id": 3,
    "order_id": "ORD-98765"
  }'
```

### Get All Open Tickets
```bash
curl -X GET "http://localhost:5000/api/tickets/status/Open?limit=20&offset=0"
```

### Update Ticket Status
```bash
curl -X PUT http://localhost:5000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Resolved"
  }'
```

### Add an Attachment
```bash
curl -X POST http://localhost:5000/api/tickets/1/attachments \
  -F "attachment=@/path/to/file.pdf"
```

### Search by Multiple Filters
```bash
curl -X GET "http://localhost:5000/api/tickets/search/filters?customer_id=1&status=Open&priority=High&limit=10"
```

## Model Methods

### TicketsModel

- `create(ticket)` - Create a new ticket
- `getById(id)` - Get ticket by ID
- `getByCustomerId(customerId)` - Get all tickets for a customer
- `getAll(limit, offset)` - Get paginated list of all tickets
- `getByStatus(status, limit, offset)` - Get tickets by status
- `getByCategory(category, limit, offset)` - Get tickets by category
- `getByPriority(priority, limit, offset)` - Get tickets by priority
- `update(id, updates)` - Update ticket
- `delete(id)` - Delete ticket
- `count()` - Get total ticket count
- `countByStatus(status)` - Get count of tickets by status
- `searchByDateRange(startDate, endDate)` - Search by date range
- `search(filters, limit, offset)` - Advanced search with multiple filters

## Notes

- Attachments are stored as JSONB metadata only, not as file storage
- The `attachments` field contains metadata about uploaded files (filename, mimetype, size, uploadedAt)
- File storage should be handled separately (e.g., S3, local filesystem)
- Always use BIGINT for IDs to support large-scale systems
- Timestamps are in UTC and in ISO 8601 format
- Status and priority fields should be enforced with enum constraints in your application logic
