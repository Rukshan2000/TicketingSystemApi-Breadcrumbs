# Approval Progress API - Complete Documentation

## NEW - Approval Progress Tracking API

A comprehensive API for tracking and monitoring the approval workflow progress of tickets and reprint requests.

---

## 📚 Documentation Files

### 1. **APPROVAL_PROGRESS_API_GUIDE.md** (Complete Reference)
Comprehensive documentation covering:
- All 3 new endpoints with full specifications
- Request/Response examples with real data
- Node status explanations
- Use cases and examples
- Integration samples (React, Node.js)
- Best practices

**When to use:** Understanding the API in detail

---

### 2. **APPROVAL_PROGRESS_QUICK_REFERENCE.md** (Quick Lookup)
Fast reference guide with:
- Endpoint summaries
- Common code snippets
- Response field explanations
- Error handling
- Quick use cases

**When to use:** Need quick answers while coding

---

### 3. **APPROVAL_PROGRESS_IMPLEMENTATION.md** (Technical Overview)
Implementation details including:
- What's new and changed
- Technical architecture
- File modifications
- Testing information
- Integration points

**When to use:** Understanding the technical implementation

---

## 🔗 New API Endpoints

### 1. Get Approval Progress for a Ticket
```http
GET /api/approvals/progress/ticket/:id
```

**Purpose:** View complete approval workflow progress for a specific ticket

**Example:**
```bash
curl -X GET http://localhost:3000/api/approvals/progress/ticket/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response includes:**
- All workflow nodes
- Current stage and status
- Individual approver decisions
- Progress percentages
- Timestamps and comments

---

### 2. Get Approval Progress for a Reprint Request
```http
GET /api/approvals/progress/reprint-request/:id
```

**Purpose:** View complete approval workflow progress for a specific reprint request

**Example:**
```bash
curl -X GET http://localhost:3000/api/approvals/progress/reprint-request/456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response format:** Identical to ticket endpoint

---

### 3. Get Approval Progress Summary
```http
GET /api/approvals/progress/summary?type=ticket&limit=10&offset=0
```

**Purpose:** Get summarized approval progress for multiple items (dashboard view)

**Parameters:**
- `type`: "ticket" or "reprint-request" (default: "ticket")
- `limit`: Number of items to return (default: 10)
- `offset`: Pagination offset (default: 0)

**Example:**
```bash
# Get 20 tickets with approval progress
curl "http://localhost:3000/api/approvals/progress/summary?type=ticket&limit=20"

# Get reprint requests with pagination
curl "http://localhost:3000/api/approvals/progress/summary?type=reprint-request&limit=10&offset=20"
```

**Response includes:**
- Multiple items with summary data
- Approval percentages
- Pagination information
- Approval counts (total, approved, rejected, pending)

---

## 📊 Response Structure

### Full Progress Response
```json
{
  "success": true,
  "data": {
    "item_id": 123,
    "item_type": "ticket",
    "item_title": "Customer Issue Description",
    "workflow_name": "Standard Approval Workflow",
    "overall_status": "PENDING",
    "overall_progress_percentage": 60,
    "current_node_order": 2,
    "nodes": [
      {
        "node_id": 10,
        "node_order": 1,
        "node_name": "Initial Review",
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
            "user_name": "John Reviewer",
            "status": "APPROVED",
            "comments": "Looks good",
            "action_at": "2025-01-06T11:00:00Z"
          }
        ]
      }
    ]
  }
}
```

### Summary Response
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Customer Issue Description",
      "workflow_name": "Standard Approval Workflow",
      "approval_status": "PENDING",
      "total_approvals": 5,
      "approved": 3,
      "rejected": 0,
      "pending": 2,
      "approval_percentage": 60
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 47
  }
}
```

---

## 🎯 Node Status Values

| Status | Meaning |
|--------|---------|
| `NOT_REACHED` | Item hasn't reached this workflow stage yet |
| `IN_PROGRESS` | Item is currently being reviewed at this stage |
| `COMPLETED` | All approvers have approved and item moved on |
| `REJECTED` | Item was rejected at this stage |

---

## ✅ Use Cases

### Dashboard Widget
Display approval progress bars for pending items:
```javascript
const response = await fetch('/api/approvals/progress/summary?type=ticket&limit=10');
const { data } = await response.json();

data.forEach(item => {
  console.log(`${item.title}: ${item.approval_percentage}% complete`);
});
```

### Item Detail View
Show complete approval history:
```javascript
const response = await fetch(`/api/approvals/progress/ticket/${ticketId}`);
const { data } = await response.json();

data.nodes.forEach(node => {
  console.log(`Node: ${node.node_name}`);
  node.approvals.forEach(approval => {
    console.log(`  ${approval.user_name}: ${approval.status}`);
  });
});
```

### Approval Monitoring
Track items waiting for action:
```javascript
const response = await fetch('/api/approvals/progress/summary');
const { data } = await response.json();

const waiting = data.filter(item => item.pending > 0);
console.log(`${waiting.length} items waiting for approval`);
```

---

## 🧪 Testing

A test script is provided: `test_approval_progress.sh`

Run all tests:
```bash
bash test_approval_progress.sh
```

With custom auth token:
```bash
AUTH_TOKEN='your_token' bash test_approval_progress.sh
```

---

## 🔌 Integration Examples

### React Component
```javascript
import { useEffect, useState } from 'react';

function ApprovalProgressWidget({ ticketId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/approvals/progress/ticket/${ticketId}`)
      .then(r => r.json())
      .then(({ data }) => {
        setProgress(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [ticketId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="progress-widget">
      <h2>{progress.item_title}</h2>
      <div className="progress-bar">
        <div 
          style={{ width: `${progress.overall_progress_percentage}%` }}
          className="progress-fill"
        >
          {progress.overall_progress_percentage}%
        </div>
      </div>
      {progress.nodes.map(node => (
        <div key={node.node_id} className="node">
          <h3>{node.node_name}</h3>
          <p>Status: {node.status}</p>
          <p>Approved: {node.statistics.approved}/{node.statistics.total_approvers}</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue.js Component
```javascript
<template>
  <div class="approval-progress">
    <h2>{{ progress.item_title }}</h2>
    <div class="progress-bar">
      <div :style="{ width: progress.overall_progress_percentage + '%' }">
        {{ progress.overall_progress_percentage }}%
      </div>
    </div>
    <div v-for="node in progress.nodes" :key="node.node_id" class="node">
      <h3>{{ node.node_name }}</h3>
      <p>Status: {{ node.status }}</p>
      <p>Approved: {{ node.statistics.approved }}/{{ node.statistics.total_approvers }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { progress: null }
  },
  async mounted() {
    const res = await fetch(`/api/approvals/progress/ticket/${this.$route.params.id}`);
    const json = await res.json();
    this.progress = json.data;
  }
}
</script>
```

---

## 🛠️ Files Modified

### Modified Files
- `controllers/workflowsController.js` - Added 2 new methods
- `routes/approvals.js` - Added 3 new routes

### New Documentation Files
- `APPROVAL_PROGRESS_API_GUIDE.md` - Complete API reference
- `APPROVAL_PROGRESS_QUICK_REFERENCE.md` - Quick lookup guide
- `APPROVAL_PROGRESS_IMPLEMENTATION.md` - Technical details
- `test_approval_progress.sh` - Test script

---

## 📋 HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request (invalid parameters) |
| `404` | Item not found |
| `500` | Server error |

---

## ⚙️ Configuration

No additional configuration needed. The API:
- Uses existing database models
- Works with current authentication
- Integrates with existing workflow system
- Compatible with all existing endpoints

---

## 🚀 Next Steps

1. **Read the Documentation**
   - Start with `APPROVAL_PROGRESS_API_GUIDE.md`
   - Use `APPROVAL_PROGRESS_QUICK_REFERENCE.md` while coding

2. **Test the Endpoints**
   - Run `test_approval_progress.sh` to validate
   - Replace test IDs with real data from your system

3. **Integrate into Frontend**
   - Use the provided React/Vue examples
   - Adapt to your component library

4. **Monitor Performance**
   - Cache results for frequently accessed items
   - Use pagination for large datasets

---

## 💡 Best Practices

1. **Use Summary for Lists**: Always use the summary endpoint for multiple items
2. **Implement Caching**: Cache results for 5-10 seconds to reduce load
3. **Handle Errors**: Check for missing workflows and invalid IDs
4. **Pagination**: Use limit/offset for large result sets
5. **Monitor Stuck Items**: Alert if items stuck > 24 hours at a node
6. **Track Rejections**: Log rejections for analysis

---

## 🔗 Related Endpoints

For approvals management, also see:
- `POST /api/approvals/tickets/:ticketId/approve` - Submit approval decision
- `GET /api/approvals/pending` - Get items pending your approval
- `GET /api/approvals/tickets/pending` - Get all pending tickets
- `GET /api/approvals/reprint-requests/pending` - Get pending reprint requests

---

## 📞 Support

For issues:
1. Check the documentation files
2. Review error messages and status codes
3. Run the test script to validate
4. Check database connectivity
5. Verify authentication tokens

---

## 📝 Version Info

- **Release Date**: January 6, 2026
- **API Version**: 1.0
- **Status**: Production Ready
- **Database**: PostgreSQL
- **Node.js**: 14+

---

For detailed information, see the individual documentation files:
- [Full API Guide](APPROVAL_PROGRESS_API_GUIDE.md)
- [Quick Reference](APPROVAL_PROGRESS_QUICK_REFERENCE.md)
- [Implementation Details](APPROVAL_PROGRESS_IMPLEMENTATION.md)
