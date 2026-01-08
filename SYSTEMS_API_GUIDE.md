# Systems API Guide

## Overview

The Systems API provides endpoints for managing system records in the ticketing system. Systems represent software systems or applications that are tracked within the organization, including their status, responsible personnel, and documentation.

## Database Schema

The `systems` table contains the following columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | BIGSERIAL | Auto | Primary key |
| `system_name` | VARCHAR(255) | Yes | Name of the system |
| `system_description` | TEXT | No | Detailed description of the system |
| `status` | VARCHAR(50) | No | Status of the system (default: 'inactive') |
| `responsible_person` | JSONB | No | JSON object containing responsible person details |
| `customers` | JSONB | No | JSON object containing customer IDs |
| `system_documentation` | TEXT | No | System documentation or notes |
| `created_at` | TIMESTAMP | Auto | Record creation timestamp |
| `updated_at` | TIMESTAMP | Auto | Last update timestamp |

### Status Values

The `status` field can contain values like:
- `pending` - System is planned or in development
- `in_progress` - System is currently being developed
- `completed` - System development is finished
- `deployed` - System has been deployed to production
- `maintenance` - System is in maintenance mode
- `cancelled` - System development has been cancelled
- `on_hold` - System development is temporarily paused

### Responsible Person JSON Structure

The `responsible_person` field expects a JSON object with the following structure:

```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "role": "Project Manager",
  "department": "IT",
  "phone": "+1-555-0123"
}
```

## API Endpoints

### Base URL
```
http://your-server:port/api/systems
```

### Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Systems

**GET** `/api/systems`

Retrieves all systems ordered by creation date (newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "system_name": "ERP System",
      "system_description": "Enterprise Resource Planning system for inventory management",
      "status": "deployed",
      "responsible_person": {
        "name": "John Doe",
        "email": "john.doe@company.com",
        "role": "Project Manager"
      },
      "customers": {
        "1": true,
        "2": true,
        "5": true
      },
      "system_documentation": "Complete documentation available at /docs/erp/",
      "created_at": "2024-01-10T10:30:00.000Z",
      "updated_at": "2024-01-15T14:20:00.000Z"
    }
  ]
}
```

### 2. Get System by ID

**GET** `/api/systems/:id`

Retrieves a specific system by its ID.

**Parameters:**
- `id` (path): System ID (integer)

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "system_name": "ERP System",
    "system_description": "Enterprise Resource Planning system",
    "status": "deployed",
    "responsible_person": {
      "name": "John Doe",
      "email": "john.doe@company.com",
      "role": "Project Manager"
    },
    "system_documentation": "Documentation available",
    "created_at": "2024-01-10T10:30:00.000Z",
    "updated_at": "2024-01-15T14:20:00.000Z"
  }
}
```

### 3. Create New System

**POST** `/api/systems`

Creates a new system record.

**Request Body:**
```json
{
  "system_name": "CRM System",
  "system_description": "Customer Relationship Management system",
  "status": "in_progress",
  "responsible_person": {
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "role": "Product Owner",
    "department": "Sales"
  },
  "customers": {
    "1": true,
    "3": true
  },
  "system_documentation": "User manual and API docs available at /docs/crm/"
}
```

**Alternative Request Body (using customers_ids):**
```json
{
  "system_name": "CRM System",
  "system_description": "Customer Relationship Management system",
  "status": "in_progress",
  "responsible_person_ids": {
    "1": true,
    "5": true
  },
  "customers_ids": {
    "1": true,
    "3": true
  },
  "system_documentation": "User manual and API docs available at /docs/crm/"
}
```

**Required Fields:**
- `system_name`: Name of the system (string, max 255 characters)

**Optional Fields:**
- `system_description`: Description (string)
- `status`: Status of the system (string, max 50 characters, default: 'pending')
- `responsible_person`: JSON object
- `system_documentation`: Documentation text

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "system_name": "CRM System",
    "system_description": "Customer Relationship Management system",
    "status": "in_progress",
    "responsible_person": {
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "role": "Product Owner",
      "department": "Sales"
    },
    "system_documentation": "User manual and API docs available at /docs/crm/",
    "created_at": "2024-01-20T09:15:00.000Z",
    "updated_at": "2024-01-20T09:15:00.000Z"
  }
}
```

### 4. Update System

**PUT** `/api/systems/:id`

Updates an existing system record.

**Parameters:**
- `id` (path): System ID (integer)

**Request Body:**
Only include fields you want to update. All fields are optional for updates.

```json
{
  "status": "completed",
  "system_description": "Updated description for the ERP system",
  "responsible_person": {
    "name": "John Doe Jr.",
    "email": "john.doe.jr@company.com",
    "role": "Senior Project Manager"
  },
  "customers": {
    "1": true,
    "2": true,
    "5": true
  }
}
```

**Alternative Request Body (using customers_ids):**
```json
{
  "status": "completed",
  "responsible_person_ids": {
    "1": true,
    "5": true
  },
  "customers_ids": {
    "1": true,
    "2": true,
    "5": true
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "system_name": "ERP System",
    "system_description": "Updated description for the ERP system",
    "status": "completed",
    "responsible_person": {
      "name": "John Doe Jr.",
      "email": "john.doe.jr@company.com",
      "role": "Senior Project Manager"
    },
    "system_documentation": "Complete documentation available at /docs/erp/",
    "created_at": "2024-01-10T10:30:00.000Z",
    "updated_at": "2024-01-20T11:45:00.000Z"
  }
### 5. Delete System

**DELETE** `/api/systems/:id`

Deletes a system record.

**Parameters:**
- `id` (path): System ID (integer)

**Response (Success):**
```json
{
  "success": true,
  "message": "System deleted successfully"
}
```

**Response (Not Found):**
```json
{
  "error": "System not found"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include an `error` field with a descriptive message.

## Data Validation

## Data Validation

## Data Validation

- `system_name`: Required, string, max 255 characters
- `system_description`: Optional, text
- `status`: Optional, string, max 50 characters, default 'inactive'
- `responsible_person` or `responsible_person_ids`: Optional, valid JSON object
- `customers` or `customers_ids`: Optional, valid JSON object
- `system_documentation`: Optional, text

## Frontend Integration Examples

### JavaScript/Fetch API

```javascript
// Get all systems
const getAllSystems = async () => {
  try {
    const response = await fetch('/api/systems', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success) {
      console.log('Systems:', data.data);
    }
  } catch (error) {
    console.error('Error fetching systems:', error);
  }
};

// Create new system
const createSystem = async (systemData) => {
  try {
    const response = await fetch('/api/systems', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(systemData)
    });
    const data = await response.json();
    if (data.success) {
      console.log('System created:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error creating system:', error);
  }
};

// Update system status
const updateSystemStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`/api/systems/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await response.json();
    if (data.success) {
      console.log('System status updated:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error updating system:', error);
  }
};
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useSystems = () => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/systems', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSystems(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSystem = async (systemData) => {
    try {
      const response = await fetch('/api/systems', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(systemData)
      });
      const data = await response.json();
      if (data.success) {
        setSystems(prev => [...prev, data.data]);
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSystem = async (id, updates) => {
    try {
      const response = await fetch(`/api/systems/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        setSystems(prev => prev.map(sys => 
          sys.id === id ? data.data : sys
        ));
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSystem = async (id) => {
    try {
      const response = await fetch(`/api/systems/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSystems(prev => prev.filter(sys => sys.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  return { 
    systems, 
    loading, 
    error, 
    fetchSystems, 
    createSystem, 
    updateSystem, 
    deleteSystem 
  };
};
```

## Notes

- The `status` field helps track the lifecycle of systems
- The `responsible_person` field accepts any valid JSON structure but typically contains contact information
- The `customers` field stores customer IDs as a JSON object (e.g., `{"1": true, "2": true}`)
- System names should be unique (enforced by application logic if needed)
- The API follows RESTful conventions
- All responses include a `success` boolean field to indicate operation status