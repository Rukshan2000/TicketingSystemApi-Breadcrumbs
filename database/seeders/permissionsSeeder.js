const { query } = require('../../config/database');

/**
 * Permissions Seeder with Hierarchical Structure
 * Seeds default permissions with parent-child relationships
 * Parent IDs: 0 = root level (main categories)
 */

const permissions = [
  // Access - Parent (ID 1, parent_id 0)
  {
    name: 'access',
    description: 'Access control and navigation',
    parent_id: null,
  },
  // {
  //   name: 'app',
  //   description: 'Access to app',
  //   parent_id: null, // Will be set after 'access' is created
  // },
  {
    name: 'portal',
    description: 'Access to portal',
    parent_id: null, // Will be set after 'access' is created
  },

  // Tickets - Parent
  {
    name: 'tickets',
    description: 'Ticket management',
    parent_id: null,
  },
  {
    name: 'create ticket',
    description: 'Create ticket',
    parent_id: null, // Will be set after 'tickets' is created
  },
  {
    name: 'update ticket',
    description: 'Update ticket',
    parent_id: null, // Will be set after 'tickets' is created
  },
  {
    name: 'delete ticket',
    description: 'Delete ticket',
    parent_id: null, // Will be set after 'tickets' is created
  },
  {
    name: 'assign workflow to ticket',
    description: 'Assign workflow to ticket',
    parent_id: null, // Will be set after 'tickets' is created
  },
  {
    name: 'add reviews',
    description: 'Add reviews',
    parent_id: null, // Will be set after 'tickets' is created
  },
  {
    name: 'view all tickets',
    description: 'View all tickets',
    parent_id: null, // Will be set after 'tickets' is created
  },
  // Workflow - Parent
  {
    name: 'workflow',
    description: 'Workflow management',
    parent_id: null,
  },
  {
    name: 'view workflow',
    description: 'View workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'create workflow',
    description: 'Create workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'edit workflow',
    description: 'Edit workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'delete workflow',
    description: 'Delete workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'assign user to workflow',
    description: 'Assign user to workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },

  // User - Parent
  {
    name: 'user',
    description: 'User management',
    parent_id: null,
  },
  {
    name: 'view users',
    description: 'View users',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'add user',
    description: 'Add user',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'edit user',
    description: 'Edit user',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'delete user',
    description: 'Delete user',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'change user status',
    description: 'Change user status',
    parent_id: null, // Will be set after 'user' is created
  },

  // Role - Parent
  {
    name: 'role',
    description: 'Role management',
    parent_id: null,
  },
  {
    name: 'view roles',
    description: 'View roles',
    parent_id: null, // Will be set after 'role' is created
  },
  {
    name: 'create role',
    description: 'Create role',
    parent_id: null, // Will be set after 'role' is created
  },
  {
    name: 'edit role',
    description: 'Edit role',
    parent_id: null, // Will be set after 'role' is created
  },
  {
    name: 'delete role',
    description: 'Delete role',
    parent_id: null, // Will be set after 'role' is created
  },

  // Reports - Parent
  {
    name: 'reports',
    description: 'Reports management',
    parent_id: null,
  },
  {
    name: 'view ticket reports',
    description: 'View ticket reports',
    parent_id: null, // Will be set after 'reports' is created
  },
  {
    name: 'view user reports',
    description: 'View user reports',
    parent_id: null, // Will be set after 'reports' is created
  },
  {
    name: 'view workflow reports',
    description: 'View workflow reports',
    parent_id: null, // Will be set after 'reports' is created
  },
  {
    name: 'view review reports',
    description: 'View review reports',
    parent_id: null, // Will be set after 'reports' is created
  },
  {
    name: 'create custom reports',
    description: 'Create custom reports',
    parent_id: null, // Will be set after 'reports' is created
  },

  // Approval Progress - Parent
  {
    name: 'approval progress',
    description: 'Approval progress management',
    parent_id: null,
  },
  {
    name: 'view all progress',
    description: 'View progress',
    parent_id: null, // Will be set after 'approval progress' is created
  },

  // Messages - Parent
  {
    name: 'messages',
    description: 'Messages management',
    parent_id: null,
  },
  {
    name: 'allow chats',
    description: 'Allow chats',
    parent_id: null, // Will be set after 'messages' is created
  },

  // Reviews - Parent
  {
    name: 'reviews',
    description: 'Reviews management',
    parent_id: null,
  },
  {
    name: 'view all reviews',
    description: 'View all reviews',
    parent_id: null, // Will be set after 'reviews' is created
  },

];

// Parent permission names that should have parent_id = null (root level)
const parentPermissions = [
  'access',
  'tickets',
  'workflow',
  'user',
  'role',
  'reports',
  'approval progress',
  'messages',
  'reviews',
];

// Child permission mappings
const childPermissionMap = {
  'access': ['portal'],
  'tickets': ['create ticket', 'update ticket', 'delete ticket', 'assign workflow to ticket', 'add reviews', 'view all tickets'],
  'workflow': ['view workflow', 'create workflow', 'edit workflow', 'delete workflow', 'assign user to workflow'],
  'user': ['view users', 'add user', 'edit user', 'delete user', 'change user status'],
  'role': ['view roles', 'create role', 'edit role', 'delete role'],
  'reports': ['view ticket reports', 'view user reports', 'view workflow reports', 'view review reports', 'create custom reports'],
  'approval progress': ['view all progress'],
  'messages': ['allow chats'],
  'reviews': ['view all reviews'],
};

const seed = async () => {
  try {
    console.log('🌱 Seeding permissions with hierarchical structure...');

    // Store parent IDs for reference
    const parentIds = {};

    // First pass: Insert all parent permissions (parent_id = null)
    for (const parentName of parentPermissions) {
      const insertQuery = `
        INSERT INTO permissions (name, description, parent_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET description = $2, parent_id = $3
        RETURNING id, name;
      `;

      const result = await query(insertQuery, [parentName, 
        permissions.find(p => p.name === parentName)?.description || '', 
        null
      ]);

      if (result.rows.length > 0) {
        parentIds[parentName] = result.rows[0].id;
        console.log(`  ✓ Parent permission '${parentName}' (ID: ${result.rows[0].id})`);
      }
    }

    // Second pass: Insert all child permissions with correct parent_id
    for (const [parentName, childNames] of Object.entries(childPermissionMap)) {
      const parentId = parentIds[parentName];

      for (const childName of childNames) {
        const childPerm = permissions.find(p => p.name === childName);
        const insertQuery = `
          INSERT INTO permissions (name, description, parent_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (name) DO UPDATE SET description = $2, parent_id = $3
          RETURNING id, name;
        `;

        const result = await query(insertQuery, [
          childName,
          childPerm?.description || '',
          parentId,
        ]);

        if (result.rows.length > 0) {
          console.log(`  ✓ Child permission '${childName}' (ID: ${result.rows[0].id}, Parent ID: ${parentId})`);
        }
      }
    }

    console.log(`✅ ${permissions.length} permissions seeded successfully with hierarchy`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error.message);
    throw error;
  }
};

module.exports = { seed, permissions };
