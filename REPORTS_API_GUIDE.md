# Reports API Guide

## Overview

The Reports API provides flexible querying capabilities that allow the frontend to join tables and generate custom reports. It includes both pre-built reports for common use cases and a powerful custom query endpoint for advanced reporting needs.

## Base URL
```
/api/reports
```

## Endpoints

### 1. Get Available Tables
Get a list of all tables available for reporting, their columns, and joinable relationships.

```http
GET /api/reports/tables
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tables": {
      "support_tickets": {
        "columns": ["id", "customer_id", "subject", "description", "category", "priority", "product_id", "order_id", "attachments", "status", "created_at", "updated_at"],
        "joinableTables": ["users", "customer_reviews", "ticket_approvals"]
      },
      "users": {
        "columns": ["id", "first_name", "last_name", "username", "email", "phone", "role", "status", "department", "is_verified", "last_login", "created_at", "updated_at"],
        "joinableTables": ["support_tickets", "workflows", "ticket_approvals"]
      }
      // ... more tables
    },
    "allowedOperators": ["=", "!=", "<", ">", "<=", ">=", "LIKE", "ILIKE", "IN", "NOT IN", "IS NULL", "IS NOT NULL", "BETWEEN"],
    "allowedAggregations": ["COUNT", "SUM", "AVG", "MIN", "MAX", "COUNT_DISTINCT"]
  }
}
```

---

### 2. Execute Custom Report
Execute a custom query with flexible table joins, filters, aggregations, and grouping.

```http
POST /api/reports/custom
```

**Request Body:**
```json
{
  "baseTable": "support_tickets",
  "joins": ["users", "customer_reviews"],
  "columns": [
    { "table": "support_tickets", "column": "id", "alias": "ticket_id" },
    { "table": "support_tickets", "column": "subject" },
    { "table": "support_tickets", "column": "status" },
    { "table": "users", "column": "first_name" },
    { "table": "users", "column": "last_name" },
    { "table": "users", "column": "email" }
  ],
  "filters": [
    { "table": "support_tickets", "column": "status", "operator": "=", "value": "Open" },
    { "table": "support_tickets", "column": "created_at", "operator": ">=", "value": "2025-01-01" }
  ],
  "orderBy": [
    { "table": "support_tickets", "column": "created_at", "direction": "DESC" }
  ],
  "limit": 100,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "ticket_id": 1,
        "support_tickets_subject": "Issue with login",
        "support_tickets_status": "Open",
        "users_first_name": "John",
        "users_last_name": "Doe",
        "users_email": "john@example.com"
      }
    ],
    "total": 150,
    "limit": 100,
    "offset": 0,
    "query": "SELECT st.id AS \"ticket_id\", ..."
  }
}
```

---

### 3. Custom Report with Aggregations
Generate grouped/aggregated reports.

```http
POST /api/reports/custom
```

**Request Body (Aggregation Example):**
```json
{
  "baseTable": "support_tickets",
  "joins": ["users"],
  "columns": [
    { "table": "support_tickets", "column": "category" },
    { "table": "support_tickets", "column": "status" }
  ],
  "aggregations": [
    { "function": "COUNT", "table": "support_tickets", "column": "id", "alias": "ticket_count" },
    { "function": "AVG", "table": "customer_reviews", "column": "rating", "alias": "avg_rating" }
  ],
  "groupBy": [
    { "table": "support_tickets", "column": "category" },
    { "table": "support_tickets", "column": "status" }
  ],
  "filters": [
    { "table": "support_tickets", "column": "created_at", "operator": ">=", "value": "2025-01-01" }
  ],
  "orderBy": [
    { "table": "support_tickets", "column": "category", "direction": "ASC" }
  ],
  "limit": 100
}
```

---

### 4. Export Report
Export report data to CSV or JSON format.

```http
POST /api/reports/export
```

**Request Body:**
```json
{
  "baseTable": "support_tickets",
  "joins": ["users"],
  "columns": [
    { "table": "support_tickets", "column": "id" },
    { "table": "support_tickets", "column": "subject" },
    { "table": "users", "column": "email" }
  ],
  "filters": [
    { "table": "support_tickets", "column": "status", "operator": "=", "value": "Open" }
  ],
  "format": "csv"
}
```

**Response (CSV):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=report_1704657600000.csv

id,subject,email
1,"Login Issue",john@example.com
2,"Payment Problem",jane@example.com
```

---

### 5. Dashboard Summary
Get a comprehensive dashboard summary with key metrics.

```http
GET /api/reports/dashboard?startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": {
      "total": "500",
      "open": "120",
      "in_progress": "80",
      "resolved": "200",
      "closed": "100"
    },
    "users": {
      "total": "150",
      "active": "140",
      "inactive": "10",
      "admins": "5",
      "moderators": "15",
      "users": "130"
    },
    "approvals": {
      "total": "300",
      "pending": "50",
      "approved": "200",
      "rejected": "50"
    },
    "reviews": {
      "total": "250",
      "average_rating": "4.2",
      "approved": "200"
    },
    "recentTickets": [...],
    "ticketTrend": [
      { "date": "2025-01-01", "count": "15" },
      { "date": "2025-01-02", "count": "22" }
    ]
  }
}
```

---

### 6. Ticket Summary Report
Get ticket statistics grouped by status, category, or priority.

```http
GET /api/reports/tickets/summary?groupBy=category&startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupBy | string | Group by: `status`, `category`, or `priority` |
| startDate | string | Filter start date (YYYY-MM-DD) |
| endDate | string | Filter end date (YYYY-MM-DD) |
| customerId | number | Filter by customer ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "category": "Technical",
        "count": "150",
        "open_count": "30",
        "in_progress_count": "20",
        "resolved_count": "70",
        "closed_count": "30",
        "first_ticket": "2025-01-01T10:00:00.000Z",
        "last_ticket": "2025-12-15T15:30:00.000Z"
      },
      {
        "category": "Billing",
        "count": "100",
        "open_count": "10",
        "in_progress_count": "15",
        "resolved_count": "50",
        "closed_count": "25"
      }
    ],
    "groupBy": "category",
    "filters": { "startDate": "2025-01-01", "endDate": "2025-12-31" }
  }
}
```

---

### 7. User Activity Report
Get user activity metrics including tickets created and approvals made.

```http
GET /api/reports/users/activity?role=admin&startDate=2025-01-01
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Filter start date |
| endDate | string | Filter end date |
| userId | number | Filter by specific user |
| role | string | Filter by role: `admin`, `moderator`, `user` |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "role": "admin",
        "status": "active",
        "department": "Support",
        "last_login": "2025-12-20T10:00:00.000Z",
        "tickets_created": "45",
        "approvals_made": "120",
        "approvals_approved": "100",
        "approvals_rejected": "20"
      }
    ],
    "filters": { "role": "admin", "startDate": "2025-01-01" }
  }
}
```

---

### 8. Workflow Performance Report
Get workflow and approval node performance metrics.

```http
GET /api/reports/workflows/performance?workflowId=1&startDate=2025-01-01
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| workflowId | number | Filter by workflow ID |
| startDate | string | Filter start date |
| endDate | string | Filter end date |

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": [
      {
        "workflow_id": 1,
        "workflow_name": "Standard Approval",
        "node_id": 1,
        "node_name": "Manager Review",
        "node_order": 1,
        "approval_type": "ANY",
        "total_tickets": "50",
        "pending_count": "5",
        "approved_count": "40",
        "rejected_count": "5",
        "avg_approval_hours": "24.5"
      }
    ],
    "filters": { "workflowId": 1, "startDate": "2025-01-01" }
  }
}
```

---

### 9. Reviews Analytics Report
Get customer review analytics and rating distribution.

```http
GET /api/reports/reviews/analytics?minRating=1&maxRating=5&startDate=2025-01-01
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Filter start date |
| endDate | string | Filter end date |
| minRating | number | Minimum rating filter |
| maxRating | number | Maximum rating filter |

**Response:**
```json
{
  "success": true,
  "data": {
    "byRating": [
      {
        "rating": 5,
        "review_count": "100",
        "avg_helpful": "5.2",
        "avg_unhelpful": "0.3",
        "approved_count": "95",
        "pending_count": "3",
        "rejected_count": "2"
      },
      {
        "rating": 4,
        "review_count": "80",
        "avg_helpful": "4.1",
        "avg_unhelpful": "0.5"
      }
    ],
    "overall": {
      "total_reviews": "250",
      "average_rating": "4.2",
      "min_rating": "1",
      "max_rating": "5",
      "total_helpful": "500",
      "total_unhelpful": "50"
    },
    "filters": { "minRating": 1, "maxRating": 5, "startDate": "2025-01-01" }
  }
}
```

---

## Available Tables for Custom Reports

| Table | Description |
|-------|-------------|
| `support_tickets` | Support tickets with customer info |
| `users` | User accounts and profiles |
| `workflows` | Workflow definitions |
| `workflow_nodes` | Workflow approval nodes |
| `ticket_approvals` | Ticket approval records |
| `customer_reviews` | Customer review ratings |
| `workflow_node_users` | Users assigned to workflow nodes |
| `reprint_requests` | Reprint request records |
| `chat_conversations` | Chat conversation records |
| `chat_messages` | Individual chat messages |

---

## Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal to | `{ "operator": "=", "value": "Open" }` |
| `!=` | Not equal to | `{ "operator": "!=", "value": "Closed" }` |
| `<` | Less than | `{ "operator": "<", "value": 100 }` |
| `>` | Greater than | `{ "operator": ">", "value": 0 }` |
| `<=` | Less than or equal | `{ "operator": "<=", "value": 5 }` |
| `>=` | Greater than or equal | `{ "operator": ">=", "value": 1 }` |
| `LIKE` | Pattern match (case-sensitive) | `{ "operator": "LIKE", "value": "%issue%" }` |
| `ILIKE` | Pattern match (case-insensitive) | `{ "operator": "ILIKE", "value": "%Issue%" }` |
| `IN` | In list of values | `{ "operator": "IN", "value": ["Open", "In Progress"] }` |
| `NOT IN` | Not in list | `{ "operator": "NOT IN", "value": ["Closed"] }` |
| `IS NULL` | Is null | `{ "operator": "IS NULL" }` |
| `IS NOT NULL` | Is not null | `{ "operator": "IS NOT NULL" }` |
| `BETWEEN` | Between two values | `{ "operator": "BETWEEN", "value": ["2025-01-01", "2025-12-31"] }` |

---

## Aggregation Functions

| Function | Description |
|----------|-------------|
| `COUNT` | Count of records |
| `COUNT_DISTINCT` | Count of distinct values |
| `SUM` | Sum of numeric values |
| `AVG` | Average of numeric values |
| `MIN` | Minimum value |
| `MAX` | Maximum value |

---

## Frontend Integration Examples

### React Example - Custom Report Builder

```javascript
const buildReport = async () => {
  const reportConfig = {
    baseTable: 'support_tickets',
    joins: ['users'],
    columns: [
      { table: 'support_tickets', column: 'id', alias: 'ticket_id' },
      { table: 'support_tickets', column: 'subject' },
      { table: 'support_tickets', column: 'status' },
      { table: 'support_tickets', column: 'created_at' },
      { table: 'users', column: 'first_name' },
      { table: 'users', column: 'email' }
    ],
    filters: [
      { table: 'support_tickets', column: 'status', operator: 'IN', value: ['Open', 'In Progress'] },
      { table: 'support_tickets', column: 'created_at', operator: '>=', value: '2025-01-01' }
    ],
    orderBy: [
      { table: 'support_tickets', column: 'created_at', direction: 'DESC' }
    ],
    limit: 50,
    offset: 0
  };

  const response = await fetch('/api/reports/custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportConfig)
  });

  const result = await response.json();
  console.log(result.data.rows);
};
```

### Export to CSV

```javascript
const exportReport = async () => {
  const response = await fetch('/api/reports/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baseTable: 'support_tickets',
      joins: ['users'],
      columns: [
        { table: 'support_tickets', column: 'id' },
        { table: 'support_tickets', column: 'subject' },
        { table: 'users', column: 'email' }
      ],
      format: 'csv'
    })
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'report.csv';
  a.click();
};
```

### Dashboard Summary

```javascript
const getDashboard = async () => {
  const response = await fetch('/api/reports/dashboard?startDate=2025-01-01&endDate=2025-12-31');
  const { data } = await response.json();
  
  console.log('Total Tickets:', data.tickets.total);
  console.log('Open Tickets:', data.tickets.open);
  console.log('Average Rating:', data.reviews.average_rating);
};
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Invalid base table",
  "allowedTables": ["support_tickets", "users", "workflows", ...]
}
```

Common error codes:
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error
