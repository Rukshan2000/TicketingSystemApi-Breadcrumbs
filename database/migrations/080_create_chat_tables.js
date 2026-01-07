/**
 * Migration: Create chat conversations and messages tables
 */

const up = async () => {
  try {
    console.log('Creating chat tables...');
    const { query } = require('../../config/database');

    // Create conversations table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        customer_id BIGINT NOT NULL,
        ticket_id BIGINT REFERENCES support_tickets(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'ON_HOLD')),
        assigned_admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255),
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP NULL
      );
    `);

    // Create messages table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('USER', 'ADMIN', 'SYSTEM')),
        message TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_conversations_customer_id ON chat_conversations(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned_admin_id ON chat_conversations(assigned_admin_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read)');

    console.log('✅ Chat tables created successfully');
  } catch (error) {
    console.error('❌ Error creating chat tables:', error.message);
    throw error;
  }
};

const down = async () => {
  try {
    console.log('Dropping chat tables...');
    const { query } = require('../../config/database');

    await query('DROP TABLE IF EXISTS chat_messages CASCADE');
    await query('DROP TABLE IF EXISTS chat_conversations CASCADE');

    console.log('✅ Chat tables dropped');
  } catch (error) {
    console.error('❌ Error dropping chat tables:', error.message);
    throw error;
  }
};

module.exports = { up, down };
