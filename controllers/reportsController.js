const { query } = require('../config/database');

// Define available tables and their relationships for safe querying
// Updated based on actual database schema inspection
const ALLOWED_TABLES = {
  support_tickets: {
    alias: 'st',
    columns: ['id', 'customer_id', 'subject', 'description', 'category', 'priority', 'product_id', 'order_id', 'attachments', 'status', 'created_at', 'updated_at', 'workflow_id', 'approval_status', 'current_node_order'],
    joins: {
      users: { type: 'LEFT JOIN', on: 'st.customer_id = u.id', alias: 'u' },
      customer_reviews: { type: 'LEFT JOIN', on: 'st.id = cr.ticket_id', alias: 'cr' },
      ticket_approvals: { type: 'LEFT JOIN', on: 'st.id = ta.ticket_id', alias: 'ta' },
      workflows: { type: 'LEFT JOIN', on: 'st.workflow_id = w.id', alias: 'w' },
    }
  },
  users: {
    alias: 'u',
    columns: ['id', 'first_name', 'last_name', 'username', 'email', 'phone', 'role', 'status', 'department', 'is_verified', 'last_login', 'metadata', 'created_at', 'updated_at'],
    joins: {
      support_tickets: { type: 'LEFT JOIN', on: 'u.id = st.customer_id', alias: 'st' },
      workflows: { type: 'LEFT JOIN', on: 'u.id = w.created_by', alias: 'w' },
      ticket_approvals: { type: 'LEFT JOIN', on: 'u.id = ta.user_id', alias: 'ta' },
      auth_tokens: { type: 'LEFT JOIN', on: 'u.id = at.user_id', alias: 'at' },
      chat_conversations: { type: 'LEFT JOIN', on: 'u.id = cc.user_id', alias: 'cc' },
    }
  },
  workflows: {
    alias: 'w',
    columns: ['id', 'name', 'description', 'is_active', 'created_by', 'created_at', 'updated_at'],
    joins: {
      users: { type: 'LEFT JOIN', on: 'w.created_by = u.id', alias: 'u' },
      workflow_nodes: { type: 'LEFT JOIN', on: 'w.id = wn.workflow_id', alias: 'wn' },
      support_tickets: { type: 'LEFT JOIN', on: 'w.id = st.workflow_id', alias: 'st' },
    }
  },
  workflow_nodes: {
    alias: 'wn',
    columns: ['id', 'workflow_id', 'name', 'node_order', 'approval_type', 'description', 'created_at', 'updated_at'],
    joins: {
      workflows: { type: 'LEFT JOIN', on: 'wn.workflow_id = w.id', alias: 'w' },
      ticket_approvals: { type: 'LEFT JOIN', on: 'wn.id = ta.node_id', alias: 'ta' },
      workflow_node_users: { type: 'LEFT JOIN', on: 'wn.id = wnu.node_id', alias: 'wnu' },
    }
  },
  ticket_approvals: {
    alias: 'ta',
    columns: ['id', 'ticket_id', 'node_id', 'user_id', 'status', 'comments', 'action_at', 'created_at', 'updated_at'],
    joins: {
      support_tickets: { type: 'LEFT JOIN', on: 'ta.ticket_id = st.id', alias: 'st' },
      users: { type: 'LEFT JOIN', on: 'ta.user_id = u.id', alias: 'u' },
      workflow_nodes: { type: 'LEFT JOIN', on: 'ta.node_id = wn.id', alias: 'wn' },
    }
  },
  customer_reviews: {
    alias: 'cr',
    columns: ['id', 'ticket_id', 'customer_id', 'rating', 'review_text', 'helpful_count', 'unhelpful_count', 'status', 'created_at', 'updated_at'],
    joins: {
      support_tickets: { type: 'LEFT JOIN', on: 'cr.ticket_id = st.id', alias: 'st' },
      users: { type: 'LEFT JOIN', on: 'cr.customer_id = u.id', alias: 'u' },
    }
  },
  workflow_node_users: {
    alias: 'wnu',
    columns: ['id', 'node_id', 'user_id', 'created_at'],
    joins: {
      workflow_nodes: { type: 'LEFT JOIN', on: 'wnu.node_id = wn.id', alias: 'wn' },
      users: { type: 'LEFT JOIN', on: 'wnu.user_id = u.id', alias: 'u' },
    }
  },
  chat_conversations: {
    alias: 'cc',
    columns: ['id', 'user_id', 'customer_id', 'ticket_id', 'status', 'assigned_admin_id', 'subject', 'is_archived', 'created_at', 'updated_at', 'closed_at'],
    joins: {
      support_tickets: { type: 'LEFT JOIN', on: 'cc.ticket_id = st.id', alias: 'st' },
      users: { type: 'LEFT JOIN', on: 'cc.user_id = u.id', alias: 'u' },
      chat_messages: { type: 'LEFT JOIN', on: 'cc.id = cm.conversation_id', alias: 'cm' },
    }
  },
  chat_messages: {
    alias: 'cm',
    columns: ['id', 'conversation_id', 'sender_id', 'sender_type', 'message', 'attachments', 'is_read', 'read_at', 'created_at', 'updated_at'],
    joins: {
      chat_conversations: { type: 'LEFT JOIN', on: 'cm.conversation_id = cc.id', alias: 'cc' },
      users: { type: 'LEFT JOIN', on: 'cm.sender_id = u.id', alias: 'u' },
    }
  },
  auth_tokens: {
    alias: 'at',
    columns: ['id', 'user_id', 'access_token', 'refresh_token', 'token_type', 'expires_at', 'refresh_expires_at', 'is_revoked', 'device_info', 'ip_address', 'user_agent', 'created_at', 'updated_at'],
    joins: {
      users: { type: 'LEFT JOIN', on: 'at.user_id = u.id', alias: 'u' },
    }
  },
  roles: {
    alias: 'r',
    columns: ['id', 'name', 'description', 'permissions', 'is_active', 'created_at', 'updated_at'],
    joins: {}
  },
  permissions: {
    alias: 'p',
    columns: ['id', 'parent_id', 'name', 'description', 'created_at', 'updated_at'],
    joins: {}
  },
  systems: {
    alias: 'sys',
    columns: ['id', 'system_name', 'system_description', 'status', 'responsible_person', 'system_documentation', 'created_at', 'updated_at'],
    joins: {}
  }
};

// Aggregation functions allowed
const ALLOWED_AGGREGATIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COUNT_DISTINCT'];

// Operators allowed for filtering
const ALLOWED_OPERATORS = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'ILIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN'];

class ReportsController {
  /**
   * Get available tables and their columns for reporting
   */
  static async getAvailableTables(req, res) {
    try {
      const tables = {};
      
      for (const [tableName, tableConfig] of Object.entries(ALLOWED_TABLES)) {
        tables[tableName] = {
          columns: tableConfig.columns,
          joinableTables: Object.keys(tableConfig.joins || {})
        };
      }

      res.status(200).json({
        success: true,
        data: {
          tables,
          allowedOperators: ALLOWED_OPERATORS,
          allowedAggregations: ALLOWED_AGGREGATIONS
        }
      });
    } catch (error) {
      console.error('Error getting available tables:', error);
      res.status(500).json({ error: 'Failed to get available tables' });
    }
  }

  /**
   * Execute a custom report query with flexible joins
   * 
   * Request body:
   * {
   *   "baseTable": "support_tickets",
   *   "joins": ["users", "customer_reviews"],
   *   "columns": [
   *     { "table": "support_tickets", "column": "id" },
   *     { "table": "support_tickets", "column": "subject" },
   *     { "table": "users", "column": "first_name" },
   *     { "table": "users", "column": "email" }
   *   ],
   *   "filters": [
   *     { "table": "support_tickets", "column": "status", "operator": "=", "value": "Open" },
   *     { "table": "support_tickets", "column": "created_at", "operator": ">=", "value": "2025-01-01" }
   *   ],
   *   "groupBy": [
   *     { "table": "support_tickets", "column": "category" }
   *   ],
   *   "aggregations": [
   *     { "function": "COUNT", "table": "support_tickets", "column": "id", "alias": "ticket_count" }
   *   ],
   *   "orderBy": [
   *     { "table": "support_tickets", "column": "created_at", "direction": "DESC" }
   *   ],
   *   "limit": 100,
   *   "offset": 0
   * }
   */
  static async executeCustomReport(req, res) {
    try {
      const {
        baseTable,
        joins = [],
        columns = [],
        filters = [],
        groupBy = [],
        aggregations = [],
        orderBy = [],
        limit = 100,
        offset = 0
      } = req.body;

      // Validate base table
      if (!baseTable || !ALLOWED_TABLES[baseTable]) {
        return res.status(400).json({ 
          error: 'Invalid base table', 
          allowedTables: Object.keys(ALLOWED_TABLES) 
        });
      }

      const baseConfig = ALLOWED_TABLES[baseTable];
      const usedAliases = new Map([[baseTable, baseConfig.alias]]);
      const values = [];
      let paramIndex = 1;

      // Build SELECT clause
      let selectParts = [];
      
      // Add regular columns
      for (const col of columns) {
        if (!ReportsController.validateColumn(col.table, col.column, usedAliases, joins, baseTable)) {
          return res.status(400).json({ 
            error: `Invalid column: ${col.table}.${col.column}` 
          });
        }
        const alias = ReportsController.getTableAlias(col.table, usedAliases, joins, baseTable);
        const colAlias = col.alias || `${col.table}_${col.column}`;
        selectParts.push(`${alias}.${col.column} AS "${colAlias}"`);
      }

      // Add aggregation columns
      for (const agg of aggregations) {
        if (!ALLOWED_AGGREGATIONS.includes(agg.function.toUpperCase())) {
          return res.status(400).json({ 
            error: `Invalid aggregation function: ${agg.function}`,
            allowedAggregations: ALLOWED_AGGREGATIONS 
          });
        }
        
        if (agg.column !== '*' && !ReportsController.validateColumn(agg.table, agg.column, usedAliases, joins, baseTable)) {
          return res.status(400).json({ 
            error: `Invalid aggregation column: ${agg.table}.${agg.column}` 
          });
        }

        const alias = agg.column === '*' ? '' : ReportsController.getTableAlias(agg.table, usedAliases, joins, baseTable);
        const colRef = agg.column === '*' ? '*' : `${alias}.${agg.column}`;
        const aggAlias = agg.alias || `${agg.function.toLowerCase()}_${agg.column}`;
        
        if (agg.function.toUpperCase() === 'COUNT_DISTINCT') {
          selectParts.push(`COUNT(DISTINCT ${colRef}) AS "${aggAlias}"`);
        } else {
          selectParts.push(`${agg.function.toUpperCase()}(${colRef}) AS "${aggAlias}"`);
        }
      }

      if (selectParts.length === 0) {
        selectParts.push(`${baseConfig.alias}.*`);
      }

      // Build FROM clause
      let fromClause = `${baseTable} ${baseConfig.alias}`;

      // Build JOIN clauses
      const joinClauses = [];
      for (const joinTable of joins) {
        if (!baseConfig.joins || !baseConfig.joins[joinTable]) {
          // Check if join is available from any of the already joined tables
          let foundJoin = false;
          for (const [table, alias] of usedAliases.entries()) {
            const tableConfig = ALLOWED_TABLES[table];
            if (tableConfig && tableConfig.joins && tableConfig.joins[joinTable]) {
              const joinConfig = tableConfig.joins[joinTable];
              joinClauses.push(`${joinConfig.type} ${joinTable} ${joinConfig.alias} ON ${joinConfig.on}`);
              usedAliases.set(joinTable, joinConfig.alias);
              foundJoin = true;
              break;
            }
          }
          if (!foundJoin) {
            return res.status(400).json({ 
              error: `Cannot join ${joinTable} from ${baseTable}`,
              availableJoins: Object.keys(baseConfig.joins || {})
            });
          }
        } else {
          const joinConfig = baseConfig.joins[joinTable];
          joinClauses.push(`${joinConfig.type} ${joinTable} ${joinConfig.alias} ON ${joinConfig.on}`);
          usedAliases.set(joinTable, joinConfig.alias);
        }
      }

      // Build WHERE clause
      const whereParts = [];
      for (const filter of filters) {
        if (!ReportsController.validateColumn(filter.table, filter.column, usedAliases, joins, baseTable)) {
          return res.status(400).json({ 
            error: `Invalid filter column: ${filter.table}.${filter.column}` 
          });
        }

        const operator = filter.operator?.toUpperCase() || '=';
        if (!ALLOWED_OPERATORS.includes(operator)) {
          return res.status(400).json({ 
            error: `Invalid operator: ${operator}`,
            allowedOperators: ALLOWED_OPERATORS
          });
        }

        const alias = ReportsController.getTableAlias(filter.table, usedAliases, joins, baseTable);
        
        if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
          whereParts.push(`${alias}.${filter.column} ${operator}`);
        } else if (operator === 'IN' || operator === 'NOT IN') {
          if (!Array.isArray(filter.value)) {
            return res.status(400).json({ 
              error: `Value for ${operator} must be an array` 
            });
          }
          const placeholders = filter.value.map(() => `$${paramIndex++}`).join(', ');
          whereParts.push(`${alias}.${filter.column} ${operator} (${placeholders})`);
          values.push(...filter.value);
        } else if (operator === 'BETWEEN') {
          if (!Array.isArray(filter.value) || filter.value.length !== 2) {
            return res.status(400).json({ 
              error: 'BETWEEN requires an array of two values' 
            });
          }
          whereParts.push(`${alias}.${filter.column} BETWEEN $${paramIndex++} AND $${paramIndex++}`);
          values.push(...filter.value);
        } else {
          whereParts.push(`${alias}.${filter.column} ${operator} $${paramIndex++}`);
          values.push(filter.value);
        }
      }

      // Build GROUP BY clause
      const groupByParts = [];
      for (const grp of groupBy) {
        if (!ReportsController.validateColumn(grp.table, grp.column, usedAliases, joins, baseTable)) {
          return res.status(400).json({ 
            error: `Invalid group by column: ${grp.table}.${grp.column}` 
          });
        }
        const alias = ReportsController.getTableAlias(grp.table, usedAliases, joins, baseTable);
        groupByParts.push(`${alias}.${grp.column}`);
      }

      // Build ORDER BY clause
      const orderByParts = [];
      for (const ord of orderBy) {
        if (!ReportsController.validateColumn(ord.table, ord.column, usedAliases, joins, baseTable)) {
          return res.status(400).json({ 
            error: `Invalid order by column: ${ord.table}.${ord.column}` 
          });
        }
        const alias = ReportsController.getTableAlias(ord.table, usedAliases, joins, baseTable);
        const direction = ord.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderByParts.push(`${alias}.${ord.column} ${direction}`);
      }

      // Construct final query
      let sqlQuery = `SELECT ${selectParts.join(', ')} FROM ${fromClause}`;
      
      if (joinClauses.length > 0) {
        sqlQuery += ` ${joinClauses.join(' ')}`;
      }
      
      if (whereParts.length > 0) {
        sqlQuery += ` WHERE ${whereParts.join(' AND ')}`;
      }
      
      if (groupByParts.length > 0) {
        sqlQuery += ` GROUP BY ${groupByParts.join(', ')}`;
      }
      
      if (orderByParts.length > 0) {
        sqlQuery += ` ORDER BY ${orderByParts.join(', ')}`;
      }

      // Add pagination
      const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 10000);
      const safeOffset = Math.max(parseInt(offset) || 0, 0);
      sqlQuery += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      // Execute query
      const result = await query(sqlQuery, values);

      // Get total count (without limit/offset)
      let countQuery = `SELECT COUNT(*) as total FROM ${fromClause}`;
      if (joinClauses.length > 0) {
        countQuery += ` ${joinClauses.join(' ')}`;
      }
      if (whereParts.length > 0) {
        countQuery += ` WHERE ${whereParts.join(' AND ')}`;
      }
      if (groupByParts.length > 0) {
        countQuery = `SELECT COUNT(*) as total FROM (${countQuery.replace('COUNT(*) as total', '1')} GROUP BY ${groupByParts.join(', ')}) subquery`;
      }

      const countResult = await query(countQuery, values);
      const total = parseInt(countResult.rows[0]?.total || 0);

      res.status(200).json({
        success: true,
        data: {
          rows: result.rows,
          total,
          limit: safeLimit,
          offset: safeOffset,
          query: sqlQuery // For debugging/transparency
        }
      });
    } catch (error) {
      console.error('Error executing custom report:', error);
      res.status(500).json({ 
        error: 'Failed to execute report', 
        details: error.message 
      });
    }
  }

  /**
   * Validate that a column exists in the specified table
   */
  static validateColumn(tableName, columnName, usedAliases, joins, baseTable) {
    const tableConfig = ALLOWED_TABLES[tableName];
    if (!tableConfig) return false;
    if (!tableConfig.columns.includes(columnName)) return false;
    
    // Check if table is accessible (either base table or joined)
    if (tableName !== baseTable && !joins.includes(tableName)) {
      return false;
    }
    
    return true;
  }

  /**
   * Get the alias for a table
   */
  static getTableAlias(tableName, usedAliases, joins, baseTable) {
    if (usedAliases.has(tableName)) {
      return usedAliases.get(tableName);
    }
    return ALLOWED_TABLES[tableName]?.alias || tableName;
  }

  /**
   * Get pre-built ticket summary report
   */
  static async getTicketSummaryReport(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        groupBy = 'status',
        customerId
      } = req.query;

      let whereConditions = [];
      const values = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`st.created_at >= $${paramIndex++}`);
        values.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`st.created_at <= $${paramIndex++}`);
        values.push(endDate);
      }
      if (customerId) {
        whereConditions.push(`st.customer_id = $${paramIndex++}`);
        values.push(customerId);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Validate groupBy column
      const validGroupBy = ['status', 'category', 'priority'];
      const groupColumn = validGroupBy.includes(groupBy) ? groupBy : 'status';

      const sqlQuery = `
        SELECT 
          st.${groupColumn},
          COUNT(*) as count,
          COUNT(CASE WHEN st.status = 'Open' THEN 1 END) as open_count,
          COUNT(CASE WHEN st.status = 'In Progress' THEN 1 END) as in_progress_count,
          COUNT(CASE WHEN st.status = 'Resolved' THEN 1 END) as resolved_count,
          COUNT(CASE WHEN st.status = 'Closed' THEN 1 END) as closed_count,
          MIN(st.created_at) as first_ticket,
          MAX(st.created_at) as last_ticket
        FROM support_tickets st
        ${whereClause}
        GROUP BY st.${groupColumn}
        ORDER BY count DESC
      `;

      const result = await query(sqlQuery, values);

      res.status(200).json({
        success: true,
        data: {
          summary: result.rows,
          groupBy: groupColumn,
          filters: { startDate, endDate, customerId }
        }
      });
    } catch (error) {
      console.error('Error getting ticket summary report:', error);
      res.status(500).json({ error: 'Failed to get ticket summary report' });
    }
  }

  /**
   * Get user activity report
   */
  static async getUserActivityReport(req, res) {
    try {
      const { startDate, endDate, userId, role } = req.query;

      let whereConditions = [];
      const values = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`u.created_at >= $${paramIndex++}`);
        values.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`u.created_at <= $${paramIndex++}`);
        values.push(endDate);
      }
      if (userId) {
        whereConditions.push(`u.id = $${paramIndex++}`);
        values.push(userId);
      }
      if (role) {
        whereConditions.push(`u.role = $${paramIndex++}`);
        values.push(role);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const sqlQuery = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.username,
          u.email,
          u.role,
          u.status,
          u.department,
          u.last_login,
          COUNT(DISTINCT st.id) as tickets_created,
          COUNT(DISTINCT ta.id) as approvals_made,
          COUNT(DISTINCT CASE WHEN ta.status = 'APPROVED' THEN ta.id END) as approvals_approved,
          COUNT(DISTINCT CASE WHEN ta.status = 'REJECTED' THEN ta.id END) as approvals_rejected
        FROM users u
        LEFT JOIN support_tickets st ON u.id = st.customer_id
        LEFT JOIN ticket_approvals ta ON u.id = ta.user_id
        ${whereClause}
        GROUP BY u.id, u.first_name, u.last_name, u.username, u.email, u.role, u.status, u.department, u.last_login
        ORDER BY tickets_created DESC
      `;

      const result = await query(sqlQuery, values);

      res.status(200).json({
        success: true,
        data: {
          users: result.rows,
          filters: { startDate, endDate, userId, role }
        }
      });
    } catch (error) {
      console.error('Error getting user activity report:', error);
      res.status(500).json({ error: 'Failed to get user activity report' });
    }
  }

  /**
   * Get workflow performance report
   */
  static async getWorkflowPerformanceReport(req, res) {
    try {
      const { workflowId, startDate, endDate } = req.query;

      let whereConditions = [];
      const values = [];
      let paramIndex = 1;

      if (workflowId) {
        whereConditions.push(`w.id = $${paramIndex++}`);
        values.push(workflowId);
      }
      if (startDate) {
        whereConditions.push(`ta.created_at >= $${paramIndex++}`);
        values.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`ta.created_at <= $${paramIndex++}`);
        values.push(endDate);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const sqlQuery = `
        SELECT 
          w.id as workflow_id,
          w.name as workflow_name,
          wn.id as node_id,
          wn.name as node_name,
          wn.node_order,
          wn.approval_type,
          COUNT(DISTINCT ta.ticket_id) as total_tickets,
          COUNT(CASE WHEN ta.status = 'PENDING' THEN 1 END) as pending_count,
          COUNT(CASE WHEN ta.status = 'APPROVED' THEN 1 END) as approved_count,
          COUNT(CASE WHEN ta.status = 'REJECTED' THEN 1 END) as rejected_count,
          AVG(EXTRACT(EPOCH FROM (ta.action_at - ta.created_at))/3600) as avg_approval_hours
        FROM workflows w
        JOIN workflow_nodes wn ON w.id = wn.workflow_id
        LEFT JOIN ticket_approvals ta ON wn.id = ta.node_id
        ${whereClause}
        GROUP BY w.id, w.name, wn.id, wn.name, wn.node_order, wn.approval_type
        ORDER BY w.id, wn.node_order
      `;

      const result = await query(sqlQuery, values);

      res.status(200).json({
        success: true,
        data: {
          performance: result.rows,
          filters: { workflowId, startDate, endDate }
        }
      });
    } catch (error) {
      console.error('Error getting workflow performance report:', error);
      res.status(500).json({ error: 'Failed to get workflow performance report' });
    }
  }

  /**
   * Get reviews analytics report
   */
  static async getReviewsAnalyticsReport(req, res) {
    try {
      const { startDate, endDate, minRating, maxRating } = req.query;

      let whereConditions = [];
      const values = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`cr.created_at >= $${paramIndex++}`);
        values.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`cr.created_at <= $${paramIndex++}`);
        values.push(endDate);
      }
      if (minRating) {
        whereConditions.push(`cr.rating >= $${paramIndex++}`);
        values.push(minRating);
      }
      if (maxRating) {
        whereConditions.push(`cr.rating <= $${paramIndex++}`);
        values.push(maxRating);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const sqlQuery = `
        SELECT 
          cr.rating,
          COUNT(*) as review_count,
          AVG(cr.helpful_count) as avg_helpful,
          AVG(cr.unhelpful_count) as avg_unhelpful,
          COUNT(CASE WHEN cr.status = 'Approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN cr.status = 'Pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN cr.status = 'Rejected' THEN 1 END) as rejected_count
        FROM customer_reviews cr
        ${whereClause}
        GROUP BY cr.rating
        ORDER BY cr.rating DESC
      `;

      // Also get overall stats
      const overallQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(cr.rating) as average_rating,
          MIN(cr.rating) as min_rating,
          MAX(cr.rating) as max_rating,
          SUM(cr.helpful_count) as total_helpful,
          SUM(cr.unhelpful_count) as total_unhelpful
        FROM customer_reviews cr
        ${whereClause}
      `;

      const [ratingResult, overallResult] = await Promise.all([
        query(sqlQuery, values),
        query(overallQuery, values)
      ]);

      res.status(200).json({
        success: true,
        data: {
          byRating: ratingResult.rows,
          overall: overallResult.rows[0],
          filters: { startDate, endDate, minRating, maxRating }
        }
      });
    } catch (error) {
      console.error('Error getting reviews analytics report:', error);
      res.status(500).json({ error: 'Failed to get reviews analytics report' });
    }
  }

  /**
   * Get dashboard summary with key metrics
   */
  static async getDashboardSummary(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let whereConditions = [];
      const values = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`created_at >= $${paramIndex++}`);
        values.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`created_at <= $${paramIndex++}`);
        values.push(endDate);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Run multiple queries in parallel
      const [
        ticketStats,
        userStats,
        approvalStats,
        reviewStats,
        recentTickets,
        ticketTrend
      ] = await Promise.all([
        // Ticket statistics
        query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'Open' THEN 1 END) as open,
            COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress,
            COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
            COUNT(CASE WHEN status = 'Closed' THEN 1 END) as closed
          FROM support_tickets
          ${whereClause}
        `, values),

        // User statistics
        query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
            COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators,
            COUNT(CASE WHEN role = 'user' THEN 1 END) as users
          FROM users
          ${whereClause}
        `, values),

        // Approval statistics
        query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
          FROM ticket_approvals
          ${whereClause}
        `, values),

        // Review statistics
        query(`
          SELECT 
            COUNT(*) as total,
            AVG(rating) as average_rating,
            COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved
          FROM customer_reviews
          ${whereClause}
        `, values),

        // Recent tickets (last 10)
        query(`
          SELECT st.*, u.first_name, u.last_name, u.email
          FROM support_tickets st
          LEFT JOIN users u ON st.customer_id = u.id
          ORDER BY st.created_at DESC
          LIMIT 10
        `),

        // Ticket trend (last 30 days)
        query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM support_tickets
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `)
      ]);

      res.status(200).json({
        success: true,
        data: {
          tickets: ticketStats.rows[0],
          users: userStats.rows[0],
          approvals: approvalStats.rows[0],
          reviews: reviewStats.rows[0],
          recentTickets: recentTickets.rows,
          ticketTrend: ticketTrend.rows,
          filters: { startDate, endDate }
        }
      });
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      res.status(500).json({ error: 'Failed to get dashboard summary' });
    }
  }

  /**
   * Export report data to CSV format
   */
  static async exportReport(req, res) {
    try {
      const {
        baseTable,
        joins = [],
        columns = [],
        filters = [],
        orderBy = [],
        format = 'csv'
      } = req.body;

      // Validate base table
      if (!baseTable || !ALLOWED_TABLES[baseTable]) {
        return res.status(400).json({ 
          error: 'Invalid base table', 
          allowedTables: Object.keys(ALLOWED_TABLES) 
        });
      }

      // Use the same query building logic but without pagination
      const result = await ReportsController.buildAndExecuteQuery({
        baseTable,
        joins,
        columns,
        filters,
        orderBy,
        limit: 50000, // Max export limit
        offset: 0
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      if (format === 'csv') {
        // Convert to CSV
        const rows = result.data.rows;
        if (rows.length === 0) {
          return res.status(200).send('');
        }

        const headers = Object.keys(rows[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of rows) {
          const values = headers.map(header => {
            const val = row[header];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          });
          csvRows.push(values.join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
        return res.status(200).send(csvRows.join('\n'));
      }

      // Default to JSON
      res.status(200).json({
        success: true,
        data: result.data.rows
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      res.status(500).json({ error: 'Failed to export report' });
    }
  }

  /**
   * Helper method to build and execute query (reusable for export)
   */
  static async buildAndExecuteQuery(params) {
    const {
      baseTable,
      joins = [],
      columns = [],
      filters = [],
      groupBy = [],
      aggregations = [],
      orderBy = [],
      limit = 100,
      offset = 0
    } = params;

    const baseConfig = ALLOWED_TABLES[baseTable];
    const usedAliases = new Map([[baseTable, baseConfig.alias]]);
    const values = [];
    let paramIndex = 1;

    // Build SELECT clause
    let selectParts = [];
    
    for (const col of columns) {
      if (!ReportsController.validateColumn(col.table, col.column, usedAliases, joins, baseTable)) {
        return { success: false, error: `Invalid column: ${col.table}.${col.column}` };
      }
      const alias = ReportsController.getTableAlias(col.table, usedAliases, joins, baseTable);
      const colAlias = col.alias || `${col.table}_${col.column}`;
      selectParts.push(`${alias}.${col.column} AS "${colAlias}"`);
    }

    for (const agg of aggregations) {
      if (!ALLOWED_AGGREGATIONS.includes(agg.function.toUpperCase())) {
        return { success: false, error: `Invalid aggregation function: ${agg.function}` };
      }
      
      if (agg.column !== '*' && !ReportsController.validateColumn(agg.table, agg.column, usedAliases, joins, baseTable)) {
        return { success: false, error: `Invalid aggregation column: ${agg.table}.${agg.column}` };
      }

      const alias = agg.column === '*' ? '' : ReportsController.getTableAlias(agg.table, usedAliases, joins, baseTable);
      const colRef = agg.column === '*' ? '*' : `${alias}.${agg.column}`;
      const aggAlias = agg.alias || `${agg.function.toLowerCase()}_${agg.column}`;
      
      if (agg.function.toUpperCase() === 'COUNT_DISTINCT') {
        selectParts.push(`COUNT(DISTINCT ${colRef}) AS "${aggAlias}"`);
      } else {
        selectParts.push(`${agg.function.toUpperCase()}(${colRef}) AS "${aggAlias}"`);
      }
    }

    if (selectParts.length === 0) {
      selectParts.push(`${baseConfig.alias}.*`);
    }

    let fromClause = `${baseTable} ${baseConfig.alias}`;

    const joinClauses = [];
    for (const joinTable of joins) {
      let foundJoin = false;
      for (const [table] of usedAliases.entries()) {
        const tableConfig = ALLOWED_TABLES[table];
        if (tableConfig && tableConfig.joins && tableConfig.joins[joinTable]) {
          const joinConfig = tableConfig.joins[joinTable];
          joinClauses.push(`${joinConfig.type} ${joinTable} ${joinConfig.alias} ON ${joinConfig.on}`);
          usedAliases.set(joinTable, joinConfig.alias);
          foundJoin = true;
          break;
        }
      }
      if (!foundJoin) {
        return { success: false, error: `Cannot join ${joinTable}` };
      }
    }

    const whereParts = [];
    for (const filter of filters) {
      if (!ReportsController.validateColumn(filter.table, filter.column, usedAliases, joins, baseTable)) {
        return { success: false, error: `Invalid filter column: ${filter.table}.${filter.column}` };
      }

      const operator = filter.operator?.toUpperCase() || '=';
      if (!ALLOWED_OPERATORS.includes(operator)) {
        return { success: false, error: `Invalid operator: ${operator}` };
      }

      const alias = ReportsController.getTableAlias(filter.table, usedAliases, joins, baseTable);
      
      if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
        whereParts.push(`${alias}.${filter.column} ${operator}`);
      } else if (operator === 'IN' || operator === 'NOT IN') {
        const placeholders = filter.value.map(() => `$${paramIndex++}`).join(', ');
        whereParts.push(`${alias}.${filter.column} ${operator} (${placeholders})`);
        values.push(...filter.value);
      } else if (operator === 'BETWEEN') {
        whereParts.push(`${alias}.${filter.column} BETWEEN $${paramIndex++} AND $${paramIndex++}`);
        values.push(...filter.value);
      } else {
        whereParts.push(`${alias}.${filter.column} ${operator} $${paramIndex++}`);
        values.push(filter.value);
      }
    }

    const groupByParts = [];
    for (const grp of groupBy) {
      if (!ReportsController.validateColumn(grp.table, grp.column, usedAliases, joins, baseTable)) {
        return { success: false, error: `Invalid group by column: ${grp.table}.${grp.column}` };
      }
      const alias = ReportsController.getTableAlias(grp.table, usedAliases, joins, baseTable);
      groupByParts.push(`${alias}.${grp.column}`);
    }

    const orderByParts = [];
    for (const ord of orderBy) {
      if (!ReportsController.validateColumn(ord.table, ord.column, usedAliases, joins, baseTable)) {
        return { success: false, error: `Invalid order by column: ${ord.table}.${ord.column}` };
      }
      const alias = ReportsController.getTableAlias(ord.table, usedAliases, joins, baseTable);
      const direction = ord.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderByParts.push(`${alias}.${ord.column} ${direction}`);
    }

    let sqlQuery = `SELECT ${selectParts.join(', ')} FROM ${fromClause}`;
    
    if (joinClauses.length > 0) {
      sqlQuery += ` ${joinClauses.join(' ')}`;
    }
    
    if (whereParts.length > 0) {
      sqlQuery += ` WHERE ${whereParts.join(' AND ')}`;
    }
    
    if (groupByParts.length > 0) {
      sqlQuery += ` GROUP BY ${groupByParts.join(', ')}`;
    }
    
    if (orderByParts.length > 0) {
      sqlQuery += ` ORDER BY ${orderByParts.join(', ')}`;
    }

    sqlQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    try {
      const result = await query(sqlQuery, values);
      return {
        success: true,
        data: {
          rows: result.rows,
          query: sqlQuery
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ReportsController;
