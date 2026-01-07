# Live Chat System - Quick Reference

## Database Tables Created
- ✅ `chat_conversations` - Conversation metadata
- ✅ `chat_messages` - Message history

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Create new conversation |
| GET | `/api/chat/:conversationId` | Get conversation with messages |
| GET | `/api/chat/user/:userId` | Get user's conversations |
| GET | `/api/chat/admin/all` | Get all conversations (admin) |
| POST | `/api/chat/:conversationId/messages` | Add message |
| PUT | `/api/chat/:conversationId/assign` | Assign to admin |
| PUT | `/api/chat/:conversationId/close` | Close conversation |
| GET | `/api/chat/:conversationId/search` | Search messages |

## WebSocket Events

**Client → Server:**
- `join_conversation` - Join a chat
- `send_message` - Send message
- `typing` - Notify typing
- `stop_typing` - Stop typing
- `mark_read` - Mark message read
- `assign_admin` - Assign admin
- `close_conversation` - Close chat
- `leave_conversation` - Leave chat

**Server → Client:**
- `new_message` - New message received
- `user_typing` - User is typing
- `user_joined` - User joined
- `user_left` - User left
- `message_read` - Message marked read
- `admin_assigned` - Admin assigned
- `conversation_closed` - Chat closed
- `admin_notification` - New chat notification

## Installation Steps

1. **Migrate database** (already done)
   ```bash
   npm run migrate
   ```

2. **Install socket.io** (already done)
   ```bash
   npm install socket.io
   ```

3. **Restart server**
   ```bash
   npm run dev
   ```

4. **Connect WebSocket from frontend**
   ```javascript
   import io from 'socket.io-client';
   const socket = io('http://localhost:5000');
   ```

## Example Flow

### User starts chat
1. POST `/api/chat` → Create conversation
2. `socket.emit('join_conversation', {...})`
3. `socket.on('new_message', (msg) => {...})`

### Send message
1. `socket.emit('send_message', {...})`
2. Message auto-saved to database
3. Broadcast to all in conversation

### Admin replies
1. `socket.emit('send_message', {sender_type: 'ADMIN', ...})`
2. User receives in real-time
3. Both stored in database

## Features Included

✅ Real-time messaging (WebSocket)
✅ Message persistence (PostgreSQL)
✅ User ↔ Admin chat
✅ Typing indicators
✅ Read receipts
✅ Admin assignment
✅ Conversation management
✅ Message search
✅ Unread counters
✅ Active users tracking

## File Locations

- **Models:** `models/ChatConversations.js`, `models/ChatMessages.js`
- **Controller:** `controllers/chatController.js`
- **Routes:** `routes/chat.js`
- **WebSocket:** `utils/chatSocket.js`
- **Migration:** `database/migrations/080_create_chat_tables.js`
- **Guide:** `CHAT_SYSTEM_GUIDE.md`

## Ready to Use! 🚀

All infrastructure is in place. Start building your chat UI!
