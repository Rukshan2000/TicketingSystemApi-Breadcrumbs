const ChatConversationsModel = require('../models/ChatConversations');
const ChatMessagesModel = require('../models/ChatMessages');

class ChatSocket {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map(); // conversationId -> Set of users
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`✓ User connected: ${socket.id}`);

      // User joins a conversation
      socket.on('join_conversation', async (data) => {
        const { conversationId, userId, userType } = data;

        socket.join(`conversation_${conversationId}`);

        // Track active users in conversation
        if (!this.activeUsers.has(conversationId)) {
          this.activeUsers.set(conversationId, new Set());
        }
        this.activeUsers.get(conversationId).add(userId);

        // Notify others that user joined
        this.io.to(`conversation_${conversationId}`).emit('user_joined', {
          userId,
          userType,
          activeUsers: Array.from(this.activeUsers.get(conversationId))
        });

        console.log(`✓ User ${userId} joined conversation ${conversationId}`);
      });

      // User sends a message
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, senderId, senderType, message } = data;

          // Save message to database
          const savedMessage = await ChatMessagesModel.create({
            conversation_id: conversationId,
            sender_id: senderId,
            sender_type: senderType,
            message
          });

          // Broadcast message to all users in conversation
          this.io.to(`conversation_${conversationId}`).emit('new_message', {
            id: savedMessage.id,
            conversation_id: conversationId,
            sender_id: senderId,
            message,
            sender_type: senderType,
            created_at: savedMessage.created_at
          });

          console.log(`✓ Message saved to conversation ${conversationId}`);
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', { message: 'Failed to save message' });
        }
      });

      // User is typing
      socket.on('typing', (data) => {
        const { conversationId, userId, userName } = data;
        
        this.io.to(`conversation_${conversationId}`).emit('user_typing', {
          userId,
          userName,
          isTyping: true
        });
      });

      // User stopped typing
      socket.on('stop_typing', (data) => {
        const { conversationId, userId } = data;
        
        this.io.to(`conversation_${conversationId}`).emit('user_typing', {
          userId,
          isTyping: false
        });
      });

      // Mark message as read
      socket.on('mark_read', async (data) => {
        try {
          const { messageId } = data;
          await ChatMessagesModel.markAsRead(messageId);
          
          socket.emit('message_read', { messageId });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Assign conversation to admin
      socket.on('assign_admin', async (data) => {
        try {
          const { conversationId, adminId, conversationTitle } = data;
          
          const updated = await ChatConversationsModel.assignAdmin(conversationId, adminId);
          
          this.io.to(`conversation_${conversationId}`).emit('admin_assigned', {
            adminId,
            conversation: updated
          });

          console.log(`✓ Conversation ${conversationId} assigned to admin ${adminId}`);
        } catch (error) {
          console.error('Error assigning admin:', error);
          socket.emit('error', { message: 'Failed to assign admin' });
        }
      });

      // Close conversation
      socket.on('close_conversation', async (data) => {
        try {
          const { conversationId } = data;
          
          const closed = await ChatConversationsModel.closeConversation(conversationId);
          
          this.io.to(`conversation_${conversationId}`).emit('conversation_closed', {
            conversation: closed
          });

          console.log(`✓ Conversation ${conversationId} closed`);
        } catch (error) {
          console.error('Error closing conversation:', error);
          socket.emit('error', { message: 'Failed to close conversation' });
        }
      });

      // User leaves conversation
      socket.on('leave_conversation', (data) => {
        const { conversationId, userId } = data;

        socket.leave(`conversation_${conversationId}`);

        if (this.activeUsers.has(conversationId)) {
          this.activeUsers.get(conversationId).delete(userId);
          
          this.io.to(`conversation_${conversationId}`).emit('user_left', {
            userId,
            activeUsers: Array.from(this.activeUsers.get(conversationId))
          });
        }

        console.log(`✓ User ${userId} left conversation ${conversationId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`✓ User disconnected: ${socket.id}`);
      });
    });
  }

  // Utility method to notify admins about new conversations
  notifyAdminsNewConversation(conversation) {
    this.io.emit('admin_notification', {
      type: 'NEW_CONVERSATION',
      conversation
    });
  }

  // Utility method to send notification to specific user
  notifyUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }
}

module.exports = ChatSocket;
