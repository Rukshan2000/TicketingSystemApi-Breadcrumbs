# Approval Progress API - Quick Reference

## New Endpoints

### Get Approval Progress for a Ticket
```
GET /api/approvals/progress/ticket/:id
```

**Example**:
```bash
curl http://localhost:3000/api/approvals/progress/ticket/123
```

**Returns**: Detailed approval progress with all nodes and approver status

---

### Get Approval Progress for a Reprint Request
```
GET /api/approvals/progress/reprint-request/:id
```

**Example**:
```bash
curl http://localhost:3000/api/approvals/progress/reprint-request/456
```

**Returns**: Same structure as ticket endpoint

---

### Get Approval Progress Summary (Multiple Items)
```
GET /api/approvals/progress/summary?type=ticket&limit=10&offset=0
```

**Parameters**:
- `type`: "ticket" or "reprint-request" (default: ticket)
- `limit`: Number of items (default: 10)
- `offset`: Pagination offset (default: 0)

**Example**:
```bash
# Get 20 tickets with approval progress
curl "http://localhost:3000/api/approvals/progress/summary?type=ticket&limit=20"

# Get reprint requests with pagination
curl "http://localhost:3000/api/approvals/progress/summary?type=reprint-request&limit=10&offset=20"
```

**Returns**: Summary of multiple items with approval percentages

---

## Response Fields Explained

### Item Fields
- `item_id`: Unique identifier
- `item_type`: "ticket" or "reprint-request"
- `item_title`: Descriptive title
- `workflow_id`: Associated workflow
- `workflow_name`: Name of the workflow
- `overall_status`: "PENDING", "APPROVED", or "REJECTED"
- `current_node_order`: Which workflow stage item is at
- `overall_progress_percentage`: 0-100% completion

### Node Fields
- `node_id`: Unique node identifier
- `node_order`: Position in workflow (1, 2, 3...)
- `node_name`: Display name
- `status`: 
  - `NOT_REACHED`: Hasn't gotten to this stage yet
  - `IN_PROGRESS`: Currently at this stage
  - `COMPLETED`: All approved and moved on
  - `REJECTED`: Rejected at this stage

### Approval Fields
- `user_id`: Approver's user ID
- `user_name`: Approver's full name
- `status`: "PENDING", "APPROVED", or "REJECTED"
- `comments`: Approver's notes (if any)
- `action_at`: When they made their decision

### Statistics
- `total_approvers`: How many people need to approve
- `approved`: Number who approved
- `rejected`: Number who rejected
- `pending`: Number still waiting
- `approval_percentage`: (approved / total) * 100

---

## Common Use Cases

### 1. Check if a ticket is ready for final step
```javascript
const response = await fetch('/api/approvals/progress/ticket/123');
const { data } = await response.json();

const currentNode = data.nodes.find(n => n.status === 'IN_PROGRESS');
if (currentNode.status === 'COMPLETED') {
  // Ready for next step
}
```

### 2. Display approval progress bar
```javascript
const response = await fetch('/api/approvals/progress/summary');
const { data } = await response.json();

data.forEach(item => {
  console.log(`${item.title}: [${item.approval_percentage}%]`);
});
```

### 3. Find items stuck in approval
```javascript
const response = await fetch('/api/approvals/progress/summary');
const { data } = await response.json();

const stuck = data.filter(item => item.pending > 0);
console.log(`${stuck.length} items waiting for approval`);
```

### 4. Check who hasn't approved yet
```javascript
const response = await fetch('/api/approvals/progress/ticket/123');
const { data } = await response.json();

const currentNode = data.nodes.find(n => n.status === 'IN_PROGRESS');
const pending = currentNode.approvals.filter(a => a.status === 'PENDING');

pending.forEach(approver => {
  console.log(`Waiting on: ${approver.user_name}`);
});
```

---

## Error Handling

### Ticket Not Found
```json
{
  "error": "Ticket not found"
}
```

### No Workflow Assigned
```json
{
  "error": "Item does not have a workflow assigned"
}
```

### Invalid Type Parameter
```json
{
  "error": "Type must be \"ticket\" or \"reprint-request\""
}
```

---

## Integration Examples

### React Hook
```javascript
import { useEffect, useState } from 'react';

function useApprovalProgress(type, id) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/approvals/progress/${type}/${id}`)
      .then(r => r.json())
      .then(({ data }) => {
        setProgress(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [type, id]);

  return { progress, loading, error };
}

// Usage
const { progress } = useApprovalProgress('ticket', 123);
```

### Node.js Service
```javascript
class ApprovalService {
  async getTicketProgress(ticketId) {
    const res = await fetch(`/api/approvals/progress/ticket/${ticketId}`);
    return res.json();
  }

  async getSummary(type = 'ticket', limit = 10, offset = 0) {
    const url = `/api/approvals/progress/summary?type=${type}&limit=${limit}&offset=${offset}`;
    const res = await fetch(url);
    return res.json();
  }
}
```

---

## Best Practices

1. **Cache Results**: API responses can be cached for 5-10 seconds
2. **Use Summary for Lists**: Always use summary endpoint for multiple items
3. **Pagination**: Use limit/offset for large result sets
4. **Monitor Delays**: Alert if item stuck > 24 hours in a node
5. **Track Rejections**: Log why items were rejected for analysis

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing params, invalid type) |
| 404 | Item not found |
| 500 | Server error |

---

## Related Endpoints

- `POST /api/approvals/tickets/:ticketId/approve` - Submit approval decision
- `GET /api/approvals/pending` - Get items pending your approval
- `GET /api/approvals/tickets/pending` - Get all pending tickets
- `GET /api/approvals/reprint-requests/pending` - Get pending reprint requests

---

For full documentation, see: `APPROVAL_PROGRESS_API_GUIDE.md`
