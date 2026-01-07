# Approval Progress API Guide

This guide covers the new Approval Progress API endpoints for viewing approval workflow progress and status.

## Table of Contents
1. [Overview](#overview)
2. [Endpoints](#endpoints)
3. [Request/Response Examples](#requestresponse-examples)
4. [Status Codes](#status-codes)
5. [Use Cases](#use-cases)

---

## Overview

The Approval Progress API provides detailed insight into the status of items (tickets and reprint requests) as they move through approval workflows. It allows you to track:

- **Overall Progress**: Where an item is in the workflow
- **Node Status**: Approval status at each workflow stage
- **Approver Status**: Individual approver decisions and comments
- **Progress Percentage**: Visual progress indicators
- **Summary Views**: Quick overview of multiple items

---

## Endpoints

### 1. Get Approval Progress for a Ticket

**Endpoint**: `GET /api/approvals/progress/ticket/:id`

**Description**: Retrieves detailed approval progress for a specific ticket, showing all workflow nodes and their approval status.

**Parameters**:
- `id` (URL param, required): Ticket ID

**Response Format**:
```json
{
  "success": true,
  "data": {
    "item_id": 123,
    "item_type": "ticket",
    "item_title": "Customer Complaint - Delayed Delivery",
    "workflow_id": 5,
    "workflow_name": "Standard Ticket Approval",
    "overall_status": "PENDING",
    "current_node_order": 2,
    "overall_progress_percentage": 60,
    "created_at": "2025-01-06T10:30:00Z",
    "updated_at": "2025-01-06T14:15:00Z",
    "nodes": [
      {
        "node_id": 10,
        "node_order": 1,
        "node_name": "Initial Review",
        "description": "Initial review by support team",
        "approval_type": "sequential",
        "status": "COMPLETED",
        "statistics": {
          "total_approvers": 2,
          "approved": 2,
          "rejected": 0,
          "pending": 0,
          "approval_percentage": 100
        },
        "approvals": [
          {
            "user_id": 5,
            "user_name": "John Support",
            "status": "APPROVED",
            "comments": "Looks good, forwarding to manager",
            "action_at": "2025-01-06T11:00:00Z",
            "created_at": "2025-01-06T10:30:00Z"
          },
          {
            "user_id": 6,
            "user_name": "Jane Support",
            "status": "APPROVED",
            "comments": null,
            "action_at": "2025-01-06T10:45:00Z",
            "created_at": "2025-01-06T10:30:00Z"
          }
        ]
      },
      {
        "node_id": 11,
        "node_order": 2,
        "node_name": "Manager Review",
        "description": "Review by department manager",
        "approval_type": "any",
        "status": "IN_PROGRESS",
        "statistics": {
          "total_approvers": 3,
          "approved": 1,
          "rejected": 0,
          "pending": 2,
          "approval_percentage": 33
        },
        "approvals": [
          {
            "user_id": 7,
            "user_name": "Manager1",
            "status": "APPROVED",
            "comments": "Approved",
            "action_at": "2025-01-06T12:30:00Z",
            "created_at": "2025-01-06T10:30:00Z"
          },
          {
            "user_id": 8,
            "user_name": "Manager2",
            "status": "PENDING",
            "comments": null,
            "action_at": null,
            "created_at": "2025-01-06T10:30:00Z"
          },
          {
            "user_id": 9,
            "user_name": "Manager3",
            "status": "PENDING",
            "comments": null,
            "action_at": null,
            "created_at": "2025-01-06T10:30:00Z"
          }
        ]
      },
      {
        "node_id": 12,
        "node_order": 3,
        "node_name": "Final Approval",
        "description": "Final approval by director",
        "approval_type": "sequential",
        "status": "NOT_REACHED",
        "statistics": {
          "total_approvers": 0,
          "approved": 0,
          "rejected": 0,
          "pending": 0,
          "approval_percentage": 0
        },
        "approvals": []
      }
    ]
  }
}
```

**Example Request**:
```bash
curl -X GET http://localhost:3000/api/approvals/progress/ticket/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Node Status Values**:
- `NOT_REACHED`: Item hasn't reached this node yet
- `IN_PROGRESS`: Currently being reviewed at this node
- `COMPLETED`: All approvers at this node have approved
- `REJECTED`: Item was rejected at this node

---

### 2. Get Approval Progress for a Reprint Request

**Endpoint**: `GET /api/approvals/progress/reprint-request/:id`

**Description**: Retrieves detailed approval progress for a specific reprint request. Response structure is identical to the ticket endpoint, only `item_type` differs.

**Parameters**:
- `id` (URL param, required): Reprint Request ID

**Response Format**:
Same as ticket endpoint, but with `"item_type": "reprint-request"` and `"item_title": "Reprint Request #123"`

**Example Request**:
```bash
curl -X GET http://localhost:3000/api/approvals/progress/reprint-request/456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Approval Progress Summary

**Endpoint**: `GET /api/approvals/progress/summary`

**Description**: Retrieves a summary of approval progress for multiple items. Great for dashboards and list views.

**Query Parameters**:
- `type` (optional, default: "ticket"): "ticket" or "reprint-request"
- `limit` (optional, default: 10): Number of items to return
- `offset` (optional, default: 0): Pagination offset

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Customer Complaint - Delayed Delivery",
      "workflow_name": "Standard Ticket Approval",
      "approval_status": "PENDING",
      "current_node_order": 2,
      "total_approvals": 5,
      "approved": 3,
      "rejected": 0,
      "pending": 2,
      "approval_percentage": 60,
      "created_at": "2025-01-06T10:30:00Z",
      "updated_at": "2025-01-06T14:15:00Z"
    },
    {
      "id": 124,
      "title": "Billing Issue - Duplicate Charge",
      "workflow_name": "Standard Ticket Approval",
      "approval_status": "APPROVED",
      "current_node_order": 3,
      "total_approvals": 4,
      "approved": 4,
      "rejected": 0,
      "pending": 0,
      "approval_percentage": 100,
      "created_at": "2025-01-05T09:00:00Z",
      "updated_at": "2025-01-06T13:45:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 47
  }
}
```

**Example Requests**:
```bash
# Get ticket approval summaries
curl -X GET "http://localhost:3000/api/approvals/progress/summary?type=ticket&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get reprint request approval summaries
curl -X GET "http://localhost:3000/api/approvals/progress/summary?type=reprint-request&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Request/Response Examples

### Example 1: View Complete Ticket Progress

**Scenario**: Manager wants to check the approval status of a ticket.

**Request**:
```bash
curl -X GET http://localhost:3000/api/approvals/progress/ticket/42 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "item_id": 42,
    "item_type": "ticket",
    "item_title": "Technical Issue - Database Connection",
    "workflow_id": 1,
    "workflow_name": "Technical Support Workflow",
    "overall_status": "PENDING",
    "current_node_order": 2,
    "overall_progress_percentage": 50,
    "created_at": "2025-01-06T08:00:00Z",
    "updated_at": "2025-01-06T15:30:00Z",
    "nodes": [
      {
        "node_id": 1,
        "node_order": 1,
        "node_name": "Tier 1 Support",
        "description": "Initial technical assessment",
        "approval_type": "sequential",
        "status": "COMPLETED",
        "statistics": {
          "total_approvers": 1,
          "approved": 1,
          "rejected": 0,
          "pending": 0,
          "approval_percentage": 100
        },
        "approvals": [
          {
            "user_id": 10,
            "user_name": "Support Team Lead",
            "status": "APPROVED",
            "comments": "Issue confirmed, escalating to Tier 2",
            "action_at": "2025-01-06T09:15:00Z",
            "created_at": "2025-01-06T08:00:00Z"
          }
        ]
      },
      {
        "node_id": 2,
        "node_order": 2,
        "node_name": "Tier 2 Technical Review",
        "description": "Advanced technical review",
        "approval_type": "any",
        "status": "IN_PROGRESS",
        "statistics": {
          "total_approvers": 2,
          "approved": 0,
          "rejected": 0,
          "pending": 2,
          "approval_percentage": 0
        },
        "approvals": [
          {
            "user_id": 11,
            "user_name": "Senior Engineer",
            "status": "PENDING",
            "comments": null,
            "action_at": null,
            "created_at": "2025-01-06T08:00:00Z"
          },
          {
            "user_id": 12,
            "user_name": "Database Specialist",
            "status": "PENDING",
            "comments": null,
            "action_at": null,
            "created_at": "2025-01-06T08:00:00Z"
          }
        ]
      }
    ]
  }
}
```

### Example 2: View Approval Summary for Dashboard

**Scenario**: Admin wants to see a quick overview of all pending approvals.

**Request**:
```bash
curl -X GET "http://localhost:3000/api/approvals/progress/summary?type=ticket&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Urgent: System Down",
      "workflow_name": "Critical Issue Workflow",
      "approval_status": "PENDING",
      "current_node_order": 1,
      "total_approvals": 2,
      "approved": 0,
      "rejected": 0,
      "pending": 2,
      "approval_percentage": 0,
      "created_at": "2025-01-06T14:00:00Z",
      "updated_at": "2025-01-06T14:00:00Z"
    },
    {
      "id": 2,
      "title": "Feature Request - Dark Mode",
      "workflow_name": "Standard Ticket Approval",
      "approval_status": "PENDING",
      "current_node_order": 2,
      "total_approvals": 4,
      "approved": 2,
      "rejected": 0,
      "pending": 2,
      "approval_percentage": 50,
      "created_at": "2025-01-05T10:30:00Z",
      "updated_at": "2025-01-06T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 12
  }
}
```

---

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Approval progress retrieved successfully |
| 400 | Bad Request | Missing required parameters or invalid type |
| 404 | Not Found | Ticket/request not found or has no workflow |
| 500 | Internal Server Error | Server error while retrieving approval progress |

### Error Response Examples

**Missing Ticket**:
```json
{
  "error": "Ticket not found"
}
```

**No Workflow Assigned**:
```json
{
  "error": "Item does not have a workflow assigned"
}
```

**Invalid Type**:
```json
{
  "error": "Type must be \"ticket\" or \"reprint-request\""
}
```

---

## Use Cases

### 1. Dashboard Widget
Display approval progress for all items:
```javascript
const response = await fetch('/api/approvals/progress/summary?type=ticket&limit=10');
const { data } = await response.json();

// Display items with progress bars
data.forEach(item => {
  console.log(`${item.title}: ${item.approval_percentage}% complete`);
});
```

### 2. Item Detail View
Show complete approval history and current status:
```javascript
const ticketId = 123;
const response = await fetch(`/api/approvals/progress/ticket/${ticketId}`);
const { data } = await response.json();

// Display each node with approvals
data.nodes.forEach(node => {
  console.log(`Node: ${node.node_name}`);
  node.approvals.forEach(approval => {
    console.log(`  - ${approval.user_name}: ${approval.status}`);
  });
});
```

### 3. Approval Monitoring
Track items waiting for action:
```javascript
const response = await fetch('/api/approvals/progress/summary?type=ticket');
const { data } = await response.json();

// Find items with pending approvals
const waitingItems = data.filter(item => item.pending > 0);
console.log(`${waitingItems.length} items waiting for approval`);
```

### 4. Performance Analytics
Analyze approval workflow efficiency:
```javascript
const response = await fetch('/api/approvals/progress/summary?type=ticket&limit=100');
const { data } = await response.json();

const avgApprovalPercentage = data.reduce((sum, item) => 
  sum + item.approval_percentage, 0) / data.length;
  
console.log(`Average approval progress: ${avgApprovalPercentage}%`);
```

---

## Best Practices

1. **Use Summary Endpoint for Lists**: Always use the summary endpoint when displaying multiple items to reduce payload size.

2. **Cache Results**: Consider caching summary results for a few seconds to reduce database load.

3. **Pagination**: Use pagination with appropriate `limit` and `offset` to handle large datasets.

4. **Monitor Stuck Items**: Identify items stuck at a node for too long and send reminders.

5. **Track Rejections**: Use the node-level details to understand why items were rejected.

6. **Audit Trail**: The detailed response includes `action_at` timestamps for compliance tracking.

---

## Integration Examples

### React Component
```javascript
import { useEffect, useState } from 'react';

function ApprovalProgress({ ticketId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/approvals/progress/ticket/${ticketId}`)
      .then(res => res.json())
      .then(({ data }) => {
        setProgress(data);
        setLoading(false);
      });
  }, [ticketId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{progress.item_title}</h2>
      <div>Progress: {progress.overall_progress_percentage}%</div>
      {progress.nodes.map(node => (
        <div key={node.node_id}>
          <h3>{node.node_name}</h3>
          <p>Status: {node.status}</p>
          <p>Approved: {node.statistics.approved}/{node.statistics.total_approvers}</p>
        </div>
      ))}
    </div>
  );
}
```

### Node.js Backend
```javascript
const axios = require('axios');

async function getApprovalProgress(ticketId, token) {
  const response = await axios.get(
    `http://localhost:3000/api/approvals/progress/ticket/${ticketId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  return response.data.data;
}

// Usage
const progress = await getApprovalProgress(123, authToken);
console.log(progress);
```

---

## Questions or Issues?

For issues or feature requests, please refer to the main API documentation or contact the development team.
