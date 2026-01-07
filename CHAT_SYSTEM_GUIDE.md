# Live Chat System - Implementation Guide

## Overview
Real-time chat system using WebSockets (Socket.io) with database persistence. Users can chat with admins, and conversations are saved in the database.

---

## Database Schema

### chat_conversations
Stores conversation metadata between users and admins.

```sql
- id: BIGSERIAL (Primary Key)
- user_id: BIGINT (FK: users)
- customer_id: BIGINT
- ticket_id: BIGINT (FK: support_tickets, optional)
- subject: VARCHAR(255)
- status: VARCHAR(20) - 'OPEN', 'CLOSED', 'ON_HOLD'
- assigned_admin_id: BIGINT (FK: users, optional)
- is_archived: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- closed_at: TIMESTAMP (when conversation was closed)
```

### chat_messages
Stores individual messages in conversations.

```sql
- id: BIGSERIAL (Primary Key)
- conversation_id: BIGINT (FK: chat_conversations)
- sender_id: BIGINT (FK: users)
- sender_type: VARCHAR(20) - 'USER', 'ADMIN', 'SYSTEM'
- message: TEXT
- attachments: JSONB (file metadata array)
- is_read: BOOLEAN (default: false)
- read_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## API Endpoints (REST)

### Create Conversation
**POST** `/api/chat`

```json
{
  "user_id": 1,
  "customer_id": 5,
  "ticket_id": 10,
  "subject": "Need help with order"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "customer_id": 5,
    "status": "OPEN",
    "created_at": "2026-01-07T10:00:00Z"
  }
}
```

---

### Get Conversation with Messages
**GET** `/api/chat/:conversationId?limit=50&offset=0`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 1,
      "user_id": 1,
      "customer_id": 5,
      "status": "OPEN",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "messages": [
      {
        "id": 1,
        "conversation_id": 1,
        "sender_id": 1,
        "message": "Hello, I need help",
        "sender_type": "USER",
        "is_read": true,
        "created_at": "2026-01-07T10:01:00Z"
      }
    ],
    "pagination": { "limit": 50, "offset": 0 }
  }
}
```

---

### Get User's Conversations
**GET** `/api/chat/user/:userId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "status": "OPEN",
      "unread_count": 2,
      "last_message_at": "2026-01-07T10:30:00Z"
    }
  ]
}
```

---

### Get All Conversations (Admin)
**GET** `/api/chat/admin/all?limit=50&offset=0`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "status": "OPEN",
      "unread_count": 3,
      "assigned_admin_id": 2
    }
  ],
  "pagination": { "total": 10 }
}
```

---

### Add Message (via API)
**POST** `/api/chat/:conversationId/messages`

```json
{
  "sender_id": 1,
  "message": "Thanks for your help!",
  "sender_type": "USER"
}
```

---

### Assign Conversation to Admin
**PUT** `/api/chat/:conversationId/assign`

```json
{
  "admin_id": 3
}
```

---

### Close Conversation
**PUT** `/api/chat/:conversationId/close`

---

### Search Messages
**GET** `/api/chat/:conversationId/search?q=hello`

---

## WebSocket Events

### Client → Server

#### 1. Join Conversation
```javascript
socket.emit('join_conversation', {
  conversationId: 1,
  userId: 1,
  userType: 'USER' // or 'ADMIN'
});
```

#### 2. Send Message
```javascript
socket.emit('send_message', {
  conversationId: 1,
  senderId: 1,
  senderType: 'USER', // or 'ADMIN'
  message: 'Hello, I need help'
});
```

#### 3. User Typing
```javascript
socket.emit('typing', {
  conversationId: 1,
  userId: 1,
  userName: 'John Doe'
});
```

#### 4. Stop Typing
```javascript
socket.emit('stop_typing', {
  conversationId: 1,
  userId: 1
});
```

#### 5. Mark Message as Read
```javascript
socket.emit('mark_read', {
  messageId: 1
});
```

#### 6. Assign Admin
```javascript
socket.emit('assign_admin', {
  conversationId: 1,
  adminId: 3
});
```

#### 7. Close Conversation
```javascript
socket.emit('close_conversation', {
  conversationId: 1
});
```

#### 8. Leave Conversation
```javascript
socket.emit('leave_conversation', {
  conversationId: 1,
  userId: 1
});
```

---

### Server → Client

#### 1. New Message
```javascript
socket.on('new_message', (data) => {
  console.log('Message:', data);
  // data: { id, conversation_id, sender_id, message, sender_type, created_at }
});
```

#### 2. User Typing Indicator
```javascript
socket.on('user_typing', (data) => {
  // data: { userId, userName, isTyping }
});
```

#### 3. User Joined
```javascript
socket.on('user_joined', (data) => {
  // data: { userId, userType, activeUsers: [] }
});
```

#### 4. User Left
```javascript
socket.on('user_left', (data) => {
  // data: { userId, activeUsers: [] }
});
```

#### 5. Message Read Confirmation
```javascript
socket.on('message_read', (data) => {
  // data: { messageId }
});
```

#### 6. Admin Assigned
```javascript
socket.on('admin_assigned', (data) => {
  // data: { adminId, conversation: {...} }
});
```

#### 7. Conversation Closed
```javascript
socket.on('conversation_closed', (data) => {
  // data: { conversation: {...} }
});
```

#### 8. Admin Notification
```javascript
socket.on('admin_notification', (data) => {
  // data: { type: 'NEW_CONVERSATION', conversation: {...} }
});
```

---

## Frontend Implementation Example (JavaScript)

### HTML
```html
<div id="chat-container">
  <div id="messages-list"></div>
  <div id="typing-indicator" style="display:none;">User is typing...</div>
  <input id="message-input" type="text" placeholder="Type a message...">
  <button id="send-btn">Send</button>
</div>
```

### JavaScript
```javascript
import io from 'socket.io-client';

class ChatClient {
  constructor() {
    this.socket = io('http://localhost:5000');
    this.conversationId = null;
    this.userId = null;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Listen for new messages
    this.socket.on('new_message', (message) => {
      this.displayMessage(message);
    });

    // Listen for typing
    this.socket.on('user_typing', (data) => {
      const indicator = document.getElementById('typing-indicator');
      if (data.isTyping) {
        indicator.style.display = 'block';
      } else {
        indicator.style.display = 'none';
      }
    });

    // Listen for user joined
    this.socket.on('user_joined', (data) => {
      console.log('Active users:', data.activeUsers);
    });

    // Listen for conversation closed
    this.socket.on('conversation_closed', () => {
      alert('Conversation has been closed');
    });
  }

  joinConversation(conversationId, userId, userType = 'USER') {
    this.conversationId = conversationId;
    this.userId = userId;
    
    this.socket.emit('join_conversation', {
      conversationId,
      userId,
      userType
    });

    // Fetch previous messages
    this.loadMessages();
  }

  async loadMessages() {
    const response = await fetch(`/api/chat/${this.conversationId}?limit=50`);
    const result = await response.json();
    
    result.data.messages.forEach(msg => this.displayMessage(msg));
  }

  sendMessage(text) {
    this.socket.emit('send_message', {
      conversationId: this.conversationId,
      senderId: this.userId,
      senderType: 'USER',
      message: text
    });
    
    document.getElementById('message-input').value = '';
  }

  displayMessage(message) {
    const list = document.getElementById('messages-list');
    const msgEl = document.createElement('div');
    msgEl.className = message.sender_id === this.userId ? 'message mine' : 'message other';
    msgEl.textContent = message.message;
    list.appendChild(msgEl);
  }

  notifyTyping() {
    this.socket.emit('typing', {
      conversationId: this.conversationId,
      userId: this.userId,
      userName: 'User'
    });
  }

  stopTyping() {
    this.socket.emit('stop_typing', {
      conversationId: this.conversationId,
      userId: this.userId
    });
  }
}

// Usage
const chat = new ChatClient();
chat.joinConversation(1, 1, 'USER');

document.getElementById('send-btn').addEventListener('click', () => {
  const text = document.getElementById('message-input').value;
  if (text) chat.sendMessage(text);
});

document.getElementById('message-input').addEventListener('input', () => {
  chat.notifyTyping();
});
```

---

## Installation

### 1. Install Socket.io dependency
```bash
npm install socket.io
```

### 2. Run migration
```bash
npm run migrate
```

### 3. Restart server
```bash
npm run dev
```

### 4. Frontend: Install Socket.io client
```bash
npm install socket.io-client
```

---

## Key Features

✅ Real-time messaging with WebSockets
✅ User-to-admin conversations
✅ Message persistence in database
✅ Typing indicators
✅ Read receipts
✅ Admin assignment
✅ Conversation status tracking
✅ File attachments support (ready for implementation)
✅ Search messages functionality
✅ Unread message count

---

## Security Considerations

- Add authentication middleware to WebSocket connections
- Validate user permissions before allowing message sending
- Use JWT tokens for WebSocket authentication
- Rate limit messages to prevent spam
- Sanitize message content to prevent XSS attacks

