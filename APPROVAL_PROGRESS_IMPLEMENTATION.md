# Approval Progress API - Implementation Summary

## Overview

A new Approval Progress API has been successfully implemented to allow viewing and tracking approval workflow progress for tickets and reprint requests. This API provides detailed insight into where items are in their approval workflows and who has approved/rejected them.

## What's New

### 1. Three New API Endpoints

#### A. Get Approval Progress for a Single Ticket
```
GET /api/approvals/progress/ticket/:id
```
Returns detailed approval progress including all workflow nodes and individual approver decisions.

#### B. Get Approval Progress for a Single Reprint Request
```
GET /api/approvals/progress/reprint-request/:id
```
Same structure as ticket endpoint, for reprint requests.

#### C. Get Approval Progress Summary (Multiple Items)
```
GET /api/approvals/progress/summary?type=ticket&limit=10&offset=0
```
Returns a summary of approval progress for multiple items with pagination.

### 2. New Controller Methods

Added to `controllers/workflowsController.js`:

- `getApprovalProgress()` - Handles both ticket and reprint request approval progress queries
- `getApprovalProgressSummary()` - Returns summarized progress for multiple items

### 3. New Routes

Added to `routes/approvals.js`:

```javascript
router.get('/progress/ticket/:id', WorkflowsController.getApprovalProgress);
router.get('/progress/reprint-request/:id', WorkflowsController.getApprovalProgress);
router.get('/progress/summary', WorkflowsController.getApprovalProgressSummary);
```

### 4. Documentation

Created three comprehensive documentation files:

1. **APPROVAL_PROGRESS_API_GUIDE.md** - Full API documentation with:
   - Complete endpoint descriptions
   - Request/response examples
   - Status codes and error handling
   - Real-world use cases
   - Integration examples (React, Node.js)
   - Best practices

2. **APPROVAL_PROGRESS_QUICK_REFERENCE.md** - Quick reference guide with:
   - Endpoint summaries
   - Common use cases
   - Response field explanations
   - Code snippets
   - Error handling guide

3. **test_approval_progress.sh** - Bash test script for validating all endpoints

## Key Features

### Detailed Approval Tracking
- Shows which workflow node an item is currently at
- Displays approval status for each node
- Lists individual approver decisions and timestamps
- Includes approver comments

### Progress Metrics
- Overall progress percentage (0-100%)
- Per-node approval counts (approved, rejected, pending)
- Approval percentage per node
- Total vs. individual approver tracking

### Flexible Querying
- Get individual item progress
- Get summaries of multiple items
- Pagination support
- Works with both tickets and reprint requests

### Comprehensive Data
Each approval includes:
- Approver name and ID
- Status (PENDING, APPROVED, REJECTED)
- Comments/notes
- Timestamp of decision

## Response Structure

### Full Progress Response
```json
{
  "success": true,
  "data": {
    "item_id": 123,
    "item_type": "ticket",
    "item_title": "Issue Title",
    "workflow_name": "Approval Workflow",
    "overall_status": "PENDING",
    "overall_progress_percentage": 60,
    "nodes": [
      {
        "node_id": 1,
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
        "approvals": [...]
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
      "title": "Issue Title",
      "workflow_name": "Approval Workflow",
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

## Node Status Values

- **NOT_REACHED**: Item hasn't gotten to this workflow stage yet
- **IN_PROGRESS**: Item is currently being reviewed at this stage
- **COMPLETED**: All approvers at this stage have approved and item moved on
- **REJECTED**: Item was rejected at this stage

## Use Cases

1. **Dashboard**: Display approval progress bars for all pending items
2. **Detail View**: Show complete approval history and current status
3. **Monitoring**: Identify items stuck in approval for too long
4. **Analytics**: Analyze workflow efficiency and approval patterns
5. **Notifications**: Send reminders to pending approvers

## Technical Details

### Database Integration
The API leverages existing models:
- `TicketApprovalsModel.getByTicketId()` - Retrieves approval data
- `ReprintRequestApprovalsModel.getByReprintRequestId()` - Retrieves approval data
- `WorkflowsModel.getWorkflowWithNodes()` - Gets workflow structure
- `TicketsModel.getById()` - Gets ticket details
- `ReprintRequestsModel.getById()` - Gets reprint request details

### Performance Considerations
- Efficient SQL queries with proper JOINs
- Returns only necessary fields
- Pagination support for large datasets
- Summary endpoint optimized for list views

## Testing

A test script is provided: `test_approval_progress.sh`

Run tests with:
```bash
bash test_approval_progress.sh
```

Or with a custom auth token:
```bash
AUTH_TOKEN='your_bearer_token' bash test_approval_progress.sh
```

## Files Modified/Created

### Modified Files
1. `/controllers/workflowsController.js` - Added 2 new methods
2. `/routes/approvals.js` - Added 3 new routes

### Created Files
1. `APPROVAL_PROGRESS_API_GUIDE.md` - Full documentation
2. `APPROVAL_PROGRESS_QUICK_REFERENCE.md` - Quick reference
3. `test_approval_progress.sh` - Test script

## Integration Points

The API is fully integrated into the existing system:

- Routes are registered in `routes/approvals.js`
- Approvals routes are mounted in `server.js` at `/api/approvals`
- Uses existing authentication middleware
- Works with existing database models
- Compatible with current error handling

## Example Requests

### Get ticket approval progress
```bash
curl -X GET http://localhost:3000/api/approvals/progress/ticket/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get reprint request approval progress
```bash
curl -X GET http://localhost:3000/api/approvals/progress/reprint-request/456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get approval summary
```bash
curl -X GET "http://localhost:3000/api/approvals/progress/summary?type=ticket&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200 OK**: Successful response
- **400 Bad Request**: Invalid parameters or missing required fields
- **404 Not Found**: Item not found
- **500 Internal Server Error**: Server error

Error responses include descriptive messages:
```json
{
  "error": "Ticket not found"
}
```

## Next Steps

1. **Test the API** using the provided test script
2. **Integrate into Frontend** - Use the example React component as a starting point
3. **Monitor Usage** - Track API performance and response times
4. **Enhance Features** - Consider adding filtering, sorting, or additional metrics
5. **Set Alerts** - Create notifications for stuck items or rejections

## Support

For issues or questions:
1. Check the documentation files: `APPROVAL_PROGRESS_API_GUIDE.md`
2. Review error messages and status codes
3. Run the test script to validate endpoints
4. Check database connectivity and data integrity

## Version Information

- **Created**: January 6, 2026
- **API Version**: 1.0
- **Status**: Ready for production
- **Node.js Version**: Compatible with Node 14+
- **Database**: PostgreSQL

---

**Summary**: The Approval Progress API is now ready to use for tracking workflow approvals. It provides comprehensive insight into approval status, supports both tickets and reprint requests, and includes full documentation and testing resources.
