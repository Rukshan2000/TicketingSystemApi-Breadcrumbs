const TicketsModel = require('../models/Tickets');
const uploadTicketAttachment = require('../utils/uploadTicketAttachment');
const { query } = require('../config/database');

class TicketsController {
  static async createTicket(req, res) {
    try {
      const ticket = req.body;

      // Validate required fields
      const requiredFields = [
        'customer_id',
        'subject',
        'description',
        'category',
      ];

      for (const field of requiredFields) {
        if (!(field in ticket) || ticket[field] === undefined || ticket[field] === null || ticket[field] === '') {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      // Create ticket first (without attachments)
      const ticketData = {
        customer_id: ticket.customer_id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority || 'Medium',
        product_id: ticket.product_id || null,
        order_id: ticket.order_id || null,
        attachments: []
      };

      const newTicket = await TicketsModel.create(ticketData);

      // Handle file uploads if any
      if (req.files && req.files.length > 0) {
        const uploadedAttachments = [];
        
        for (const file of req.files) {
          try {
            const attachment = await uploadTicketAttachment(file, newTicket.id);
            uploadedAttachments.push(attachment);
          } catch (uploadError) {
            console.error('Error uploading attachment:', uploadError);
            // Continue with other files even if one fails
          }
        }

        // Update ticket with attachments if any were uploaded
        if (uploadedAttachments.length > 0) {
          const updatedTicket = await TicketsModel.update(newTicket.id, { 
            attachments: uploadedAttachments 
          });
          return res.status(201).json({ success: true, data: updatedTicket });
        }
      }

      res.status(201).json({ success: true, data: newTicket });
    } catch (error) {
      console.error('Error in createTicket:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await TicketsModel.getById(parseInt(id, 10));

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, data: ticket });
    } catch (error) {
      console.error('Error in getTicketById:', error);
      res.status(500).json({ error: 'Failed to get ticket' });
    }
  }

  static async getTicketsByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      const tickets = await TicketsModel.getByCustomerId(parseInt(customerId, 10));

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('Error in getTicketsByCustomerId:', error);
      res.status(500).json({ error: 'Failed to get tickets' });
    }
  }

  static async getTicketsByCustomerQuery(req, res) {
    try {
      const { customer_id, limit = 10, offset = 0, status, approval_status, workflow_only } = req.query;

      if (!customer_id) {
        return res.status(400).json({ error: 'customer_id query parameter is required' });
      }

      const customerId = parseInt(customer_id, 10);
      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      // Build query dynamically
      let selectQuery = `
        SELECT t.*, w.name as workflow_name, w.id as workflow_id
        FROM support_tickets t
        LEFT JOIN workflows w ON t.workflow_id = w.id
        WHERE t.customer_id = $1
      `;

      const params = [customerId];
      let paramCount = 1;

      // Add optional filters
      if (workflow_only === 'true') {
        selectQuery += ` AND t.workflow_id IS NOT NULL`;
      }

      if (status) {
        paramCount++;
        selectQuery += ` AND t.status = $${paramCount}`;
        params.push(status);
      }

      if (approval_status) {
        paramCount++;
        selectQuery += ` AND t.approval_status = $${paramCount}`;
        params.push(approval_status);
      }

      selectQuery += ` ORDER BY t.updated_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limitNum, offsetNum);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM support_tickets WHERE customer_id = $1`;
      const countParams = [customerId];

      if (workflow_only === 'true') {
        countQuery += ` AND workflow_id IS NOT NULL`;
      }
      if (status) {
        countQuery += ` AND status = $2`;
        countParams.push(status);
      }
      if (approval_status) {
        countQuery += ` AND approval_status = $${countParams.length + 1}`;
        countParams.push(approval_status);
      }

      const [ticketsResult, countResult] = await Promise.all([
        query(selectQuery, params),
        query(countQuery, countParams)
      ]);

      const tickets = ticketsResult.rows;
      const totalCount = parseInt(countResult.rows[0].count, 10);

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum)
        },
        filters: {
          customer_id: customerId,
          status: status || null,
          approval_status: approval_status || null,
          workflow_only: workflow_only === 'true'
        }
      });
    } catch (error) {
      console.error('Error in getTicketsByCustomerQuery:', error);
      res.status(500).json({ error: 'Failed to get tickets' });
    }
  }

  static async getAllTickets(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const tickets = await TicketsModel.getAll(limit, offset);
      const count = await TicketsModel.count();

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getAllTickets:', error);
      res.status(500).json({ error: 'Failed to get tickets' });
    }
  }

  static async getTicketsByStatus(req, res) {
    try {
      const { status } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const tickets = await TicketsModel.getByStatus(status, limit, offset);
      const count = await TicketsModel.countByStatus(status);

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getTicketsByStatus:', error);
      res.status(500).json({ error: 'Failed to get tickets by status' });
    }
  }

  static async getTicketsByCategory(req, res) {
    try {
      const { category } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const tickets = await TicketsModel.getByCategory(category, limit, offset);

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error('Error in getTicketsByCategory:', error);
      res.status(500).json({ error: 'Failed to get tickets by category' });
    }
  }

  static async getTicketsByPriority(req, res) {
    try {
      const { priority } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const tickets = await TicketsModel.getByPriority(priority, limit, offset);

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error('Error in getTicketsByPriority:', error);
      res.status(500).json({ error: 'Failed to get tickets by priority' });
    }
  }

  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedTicket = await TicketsModel.update(parseInt(id, 10), updates);

      if (!updatedTicket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedTicket });
    } catch (error) {
      console.error('Error in updateTicket:', error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  }

  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const deleted = await TicketsModel.delete(parseInt(id, 10));

      if (!deleted) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error in deleteTicket:', error);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }

  static async getTicketCount(req, res) {
    try {
      const count = await TicketsModel.count();
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error in getTicketCount:', error);
      res.status(500).json({ error: 'Failed to get ticket count' });
    }
  }

  static async searchByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        return;
      }

      const tickets = await TicketsModel.searchByDateRange(startDate, endDate);

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('Error in searchByDateRange:', error);
      res.status(500).json({ error: 'Failed to search tickets' });
    }
  }

  static async searchTickets(req, res) {
    try {
      const { customer_id, status, category, priority, product_id, limit = 10, offset = 0 } = req.query;

      const filters = {
        customer_id: customer_id ? parseInt(customer_id, 10) : undefined,
        status,
        category,
        priority,
        product_id: product_id ? parseInt(product_id, 10) : undefined,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const tickets = await TicketsModel.search(filters, parseInt(limit, 10), parseInt(offset, 10));

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('Error in searchTickets:', error);
      res.status(500).json({ error: 'Failed to search tickets' });
    }
  }

  static async addAttachment(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      // Get existing ticket
      const ticket = await TicketsModel.getById(parseInt(id, 10));

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Upload file to S3
      const attachment = await uploadTicketAttachment(req.file, parseInt(id, 10));

      // Add attachment to the attachments array
      const attachments = ticket.attachments || [];
      attachments.push(attachment);

      // Update ticket with new attachments
      const updatedTicket = await TicketsModel.update(parseInt(id, 10), { attachments });

      res.status(200).json({ 
        success: true, 
        data: updatedTicket,
        attachment: attachment
      });
    } catch (error) {
      console.error('Error in addAttachment:', error);
      res.status(500).json({ error: error.message || 'Failed to add attachment' });
    }
  }

  static async removeAttachment(req, res) {
    try {
      const { id, attachmentIndex } = req.params;

      // Get existing ticket
      const ticket = await TicketsModel.getById(parseInt(id, 10));

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Remove attachment from the attachments array
      const attachments = ticket.attachments || [];
      const index = parseInt(attachmentIndex, 10);

      if (index < 0 || index >= attachments.length) {
        res.status(400).json({ error: 'Invalid attachment index' });
        return;
      }

      attachments.splice(index, 1);

      // Update ticket with modified attachments
      const updatedTicket = await TicketsModel.update(parseInt(id, 10), { attachments });

      res.status(200).json({ success: true, data: updatedTicket });
    } catch (error) {
      console.error('Error in removeAttachment:', error);
      res.status(500).json({ error: 'Failed to remove attachment' });
    }
  }
}

module.exports = TicketsController;
