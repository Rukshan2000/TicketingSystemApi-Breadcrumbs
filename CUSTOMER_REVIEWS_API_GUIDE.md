# Customer Reviews API Guide

## Overview
The Customer Reviews API allows you to manage customer reviews for resolved support tickets. Customers can leave ratings and feedback on tickets, and administrators can manage, approve, and track review metrics.

## Database Table Schema

### `customer_reviews`
```sql
CREATE TABLE customer_reviews (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL (FOREIGN KEY),
  customer_id BIGINT NOT NULL,
  rating INTEGER NOT NULL (1-5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Pending' (Pending|Approved|Rejected),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ticket_id, customer_id)
);
```

### Indexes
- `idx_reviews_ticket_id` - Foreign key index on ticket_id
- `idx_reviews_customer_id` - Index on customer_id
- `idx_reviews_rating` - Index on rating
- `idx_reviews_status` - Index on status
- `idx_reviews_created_at` - Index on created_at

## Features
- ⭐ 1-5 star rating system
- 📝 Optional review text feedback
- 👍 Helpful/Unhelpful counting
- ✅ Review moderation (Pending/Approved/Rejected status)
- 📊 Average rating calculations
- 🔗 Linked to both tickets and customers
- Unique constraint: One review per customer per ticket

---

## API Endpoints

### 1. Create a New Review
**POST** `/api/reviews`

Creates a new review for a resolved ticket.

#### Request Body
```json
{
  "ticket_id": 6,
  "customer_id": 1,
  "rating": 5,
  "review_text": "Great support team, very helpful!"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ticket_id | Integer | Yes | ID of the support ticket being reviewed |
| customer_id | Integer | Yes | ID of the customer leaving the review |
| rating | Integer | Yes | Rating from 1-5 stars |
| review_text | String | No | Optional review comment/feedback |

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!",
    "helpful_count": 0,
    "unhelpful_count": 0,
    "status": "Pending",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T10:30:00Z"
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "Missing required fields: ticket_id, customer_id, rating"
}
```

#### Error Response (400 Bad Request - Invalid Rating)
```json
{
  "error": "Rating must be an integer between 1 and 5"
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!"
  }'
```

---

### 2. Get All Reviews
**GET** `/api/reviews`

Retrieves all reviews with pagination support.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 50 | Number of reviews per page (1-500) |
| offset | Integer | 0 | Number of reviews to skip |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_id": 6,
      "customer_id": 1,
      "rating": 5,
      "review_text": "Great support team, very helpful!",
      "helpful_count": 3,
      "unhelpful_count": 0,
      "status": "Approved",
      "ticket_subject": "Login Issue",
      "ticket_status": "Resolved",
      "created_at": "2026-01-07T10:30:00Z",
      "updated_at": "2026-01-07T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 45
  }
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/reviews?limit=10&offset=0"
```

---

### 3. Get Review by ID
**GET** `/api/reviews/:id`

Retrieves a specific review by its ID.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Review ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!",
    "helpful_count": 3,
    "unhelpful_count": 0,
    "status": "Approved",
    "ticket_subject": "Login Issue",
    "ticket_status": "Resolved",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T10:30:00Z"
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Review not found"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/reviews/1"
```

---

### 4. Get Reviews by Ticket ID
**GET** `/api/reviews/ticket/:ticketId`

Gets the review for a specific ticket (one review per customer per ticket).

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| ticketId | Integer | Support ticket ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!",
    "helpful_count": 3,
    "unhelpful_count": 0,
    "status": "Approved",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T10:30:00Z"
  },
  "message": "Review found"
}
```

#### Response (No Review)
```json
{
  "success": true,
  "data": null,
  "message": "No review found for this ticket"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/reviews/ticket/6"
```

---

### 5. Get Reviews by Customer ID
**GET** `/api/reviews/customer/:customerId`

Retrieves all reviews submitted by a specific customer.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| customerId | Integer | Customer ID |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 50 | Number of reviews per page (1-500) |
| offset | Integer | 0 | Number of reviews to skip |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_id": 6,
      "customer_id": 1,
      "rating": 5,
      "review_text": "Great support team, very helpful!",
      "helpful_count": 3,
      "unhelpful_count": 0,
      "status": "Approved",
      "ticket_subject": "Login Issue",
      "ticket_status": "Resolved",
      "created_at": "2026-01-07T10:30:00Z",
      "updated_at": "2026-01-07T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/reviews/customer/1?limit=10"
```

---

### 6. Get Reviews by Rating
**GET** `/api/reviews/rating/:rating`

Retrieves all reviews with a specific rating (1-5 stars).

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| rating | Integer | Star rating (1-5) |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 50 | Number of reviews per page (1-500) |
| offset | Integer | 0 | Number of reviews to skip |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_id": 6,
      "customer_id": 1,
      "rating": 5,
      "review_text": "Great support team, very helpful!",
      "helpful_count": 3,
      "unhelpful_count": 0,
      "status": "Approved",
      "ticket_subject": "Login Issue",
      "ticket_status": "Resolved",
      "created_at": "2026-01-07T10:30:00Z",
      "updated_at": "2026-01-07T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 25
  }
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/reviews/rating/5?limit=20"
```

---

### 7. Get Reviews by Status
**GET** `/api/reviews/status/:status`

Retrieves reviews filtered by moderation status.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| status | String | Status: `Pending`, `Approved`, or `Rejected` |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 50 | Number of reviews per page (1-500) |
| offset | Integer | 0 | Number of reviews to skip |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "ticket_id": 7,
      "customer_id": 2,
      "rating": 3,
      "review_text": "Good service but slow response",
      "helpful_count": 1,
      "unhelpful_count": 0,
      "status": "Pending",
      "ticket_subject": "Payment Issue",
      "ticket_status": "Resolved",
      "created_at": "2026-01-07T11:00:00Z",
      "updated_at": "2026-01-07T11:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 8
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "Status must be one of: Pending, Approved, Rejected"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/reviews/status/Pending"
```

---

### 8. Update Review
**PUT** `/api/reviews/:id`

Updates an existing review.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Review ID |

#### Request Body (all fields optional)
```json
{
  "rating": 4,
  "review_text": "Updated: Service was helpful",
  "status": "Approved",
  "helpful_count": 5,
  "unhelpful_count": 1
}
```

#### Parameters
| Field | Type | Description |
|-------|------|-------------|
| rating | Integer | Updated rating (1-5) |
| review_text | String | Updated review text |
| status | String | Updated status (Pending/Approved/Rejected) |
| helpful_count | Integer | Updated helpful count |
| unhelpful_count | Integer | Updated unhelpful count |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 4,
    "review_text": "Updated: Service was helpful",
    "helpful_count": 5,
    "unhelpful_count": 1,
    "status": "Approved",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T12:00:00Z"
  }
}
```

#### cURL Example
```bash
curl -X PUT "http://localhost:5000/api/reviews/1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved",
    "rating": 4
  }'
```

---

### 9. Delete Review
**DELETE** `/api/reviews/:id`

Deletes a review permanently.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Review ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!",
    "helpful_count": 3,
    "unhelpful_count": 0,
    "status": "Approved",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T10:30:00Z"
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Review not found"
}
```

#### cURL Example
```bash
curl -X DELETE "http://localhost:5000/api/reviews/1"
```

---

### 10. Mark Review as Helpful
**POST** `/api/reviews/:id/helpful`

Increments the helpful count for a review.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Review ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!",
    "helpful_count": 4,
    "unhelpful_count": 0,
    "status": "Approved",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T12:05:00Z"
  }
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:5000/api/reviews/1/helpful"
```

---

### 11. Mark Review as Unhelpful
**POST** `/api/reviews/:id/unhelpful`

Increments the unhelpful count for a review.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Review ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Review marked as unhelpful",
  "data": {
    "id": 1,
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Great support team, very helpful!",
    "helpful_count": 3,
    "unhelpful_count": 1,
    "status": "Approved",
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T12:10:00Z"
  }
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:5000/api/reviews/1/unhelpful"
```

---

### 12. Get Average Rating
**GET** `/api/reviews/stats/average`

Calculates average rating statistics.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| ticketId | Integer | (Optional) Filter by specific ticket ID |

#### Response (200 OK - All Reviews)
```json
{
  "success": true,
  "data": {
    "average_rating": 4.32,
    "total_reviews": 45
  }
}
```

#### Response (200 OK - By Ticket)
```json
{
  "success": true,
  "data": {
    "average_rating": 4.0,
    "total_reviews": 1
  }
}
```

#### cURL Example - Get Overall Average
```bash
curl -X GET "http://localhost:5000/api/reviews/stats/average"
```

#### cURL Example - Get Average for Specific Ticket
```bash
curl -X GET "http://localhost:5000/api/reviews/stats/average?ticketId=6"
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Review successfully created |
| 400 | Bad Request - Invalid parameters or validation failed |
| 404 | Not Found - Review or resource not found |
| 500 | Internal Server Error - Server error |

---

## Request/Response Headers

### Request Headers
```
Content-Type: application/json
```

### Response Headers
```
Content-Type: application/json
```

---

## Complete Workflow Examples

### Example 1: Customer leaves a review
```bash
# 1. Create a review
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": 6,
    "customer_id": 1,
    "rating": 5,
    "review_text": "Excellent support team!"
  }'

# Response: Review created with status "Pending"
```

### Example 2: Admin approves pending reviews
```bash
# 1. Get all pending reviews
curl -X GET "http://localhost:5000/api/reviews/status/Pending"

# 2. Approve a review
curl -X PUT "http://localhost:5000/api/reviews/1" \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'
```

### Example 3: Track review helpfulness
```bash
# 1. Get a review
curl -X GET "http://localhost:5000/api/reviews/1"

# 2. Mark as helpful (user clicks helpful)
curl -X POST "http://localhost:5000/api/reviews/1/helpful"

# 3. Get updated review
curl -X GET "http://localhost:5000/api/reviews/1"
```

### Example 4: Customer views their own reviews
```bash
curl -X GET "http://localhost:5000/api/reviews/customer/1?limit=10"
```

### Example 5: Get statistics
```bash
# Overall average rating
curl -X GET "http://localhost:5000/api/reviews/stats/average"

# Average rating for specific ticket
curl -X GET "http://localhost:5000/api/reviews/stats/average?ticketId=6"
```

---

## Database Setup

Run the migration to create the customer_reviews table:

```bash
npm run migrate
```

This will:
- Create the `customer_reviews` table with all necessary columns
- Create indexes for performance optimization
- Set up foreign key constraint with `support_tickets` table

---

## Notes

- **Unique Constraint**: Only one review per customer per ticket is allowed
- **Foreign Key**: Reviews are linked to support_tickets and will be deleted if ticket is deleted
- **Moderation**: Reviews are created with "Pending" status and must be approved before appearing
- **Helpful/Unhelpful**: These counters increment on each request (no duplicate prevention)
- **Timestamps**: `created_at` is set on creation, `updated_at` updates on any change

---

## Error Handling

Common errors and solutions:

### Duplicate Review
```json
{
  "error": "duplicate key value violates unique constraint"
}
```
**Solution**: Customer can only leave one review per ticket. Update the existing review instead.

### Invalid Rating
```json
{
  "error": "Rating must be an integer between 1 and 5"
}
```
**Solution**: Ensure rating is a whole number from 1 to 5.

### Invalid Status
```json
{
  "error": "Status must be one of: Pending, Approved, Rejected"
}
```
**Solution**: Use only valid status values: Pending, Approved, or Rejected.

---

## API Integration Tips

1. **Always validate rating input** before sending to API
2. **Handle pagination** when retrieving multiple reviews
3. **Check review status** before displaying on public pages (show only "Approved")
4. **Use ticketId filter** when getting average rating for display on ticket detail page
5. **Implement rate limiting** on review creation to prevent spam

---

**Last Updated**: January 7, 2026
