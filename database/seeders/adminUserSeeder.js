const { query } = require('../../config/database');
const bcrypt = require('bcryptjs');

/**
 * Admin and User Seeder
 * Creates admin user with all permissions and additional users
 * Usage: node database/seeders/adminUserSeeder.js
 */

const seed = async () => {
  try {
    console.log('🌱 Seeding admin user and roles with permissions...\n');

    // Step 1: Get all permissions from database
    console.log('📋 Fetching all permissions...');
    const permissionsResult = await query('SELECT id FROM permissions');
    const permissionIds = permissionsResult.rows.map(p => p.id);
    console.log(`✓ Found ${permissionIds.length} permissions\n`);

    // Step 2: Create Admin Role with all permissions
    console.log('🔐 Creating admin role...');
    const adminRoleQuery = `
      INSERT INTO roles (name, description, permissions, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO UPDATE SET description = $2, permissions = $3, is_active = $4
      RETURNING id, name;
    `;
    
    const adminRoleResult = await query(adminRoleQuery, [
      'admin',
      'Administrator role with all permissions',
      JSON.stringify(permissionIds),
      true
    ]);

    const adminRoleId = adminRoleResult.rows[0].id;
    console.log(`✓ Admin role created (ID: ${adminRoleId})\n`);

    // Step 3: Create User Role with limited permissions (view permissions only)
    console.log('👤 Creating user role...');
    const userPermissions = permissionIds.filter(id => {
      // This will be assigned dynamically - for now just get a subset
      return id <= 12; // Example: view tickets, view reprint requests, view workflow, view users, view roles
    });

    const userRoleQuery = `
      INSERT INTO roles (name, description, permissions, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO UPDATE SET description = $2, permissions = $3, is_active = $4
      RETURNING id, name;
    `;

    const userRoleResult = await query(userRoleQuery, [
      'user',
      'Standard user role with basic permissions',
      JSON.stringify(userPermissions),
      true
    ]);

    const userRoleId = userRoleResult.rows[0].id;
    console.log(`✓ User role created (ID: ${userRoleId})\n`);

    // Step 4: Create Admin User
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = 'Admin@123456';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUserQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        username,
        email,
        password,
        role,
        status,
        is_verified,
        department,
        phone,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO UPDATE SET 
        password = $5,
        role = $6,
        status = $7,
        is_verified = $8
      RETURNING id, username, email, role;
    `;

    const adminUserResult = await query(adminUserQuery, [
      'Admin',
      'User',
      'admin',
      'admin@supporttickets.com',
      adminHashedPassword,
      'admin',
      'active',
      true,
      'Administration',
      '+1-800-ADMIN-01',
      JSON.stringify({ 
        roleId: adminRoleId,
        permissions: permissionIds,
        isAdmin: true 
      })
    ]);

    const adminUser = adminUserResult.rows[0];
    console.log(`✓ Admin user created`);
    console.log(`  - Username: ${adminUser.username}`);
    console.log(`  - Email: ${adminUser.email}`);
    console.log(`  - Password: ${adminPassword}\n`);

    // Step 5: Create additional test users
    console.log('📝 Creating additional test users...\n');

    const testUsers = [
      {
        first_name: 'Support',
        last_name: 'Agent',
        username: 'support',
        email: 'support@supporttickets.com',
        password: '12345678',
        role: 'user',
        status: 'active',
        department: 'Support',
        phone: '+1-800-SUP-AGENT'
      },
      {
        first_name: 'John',
        last_name: 'Operator',
        username: 'operator',
        email: 'operator@supporttickets.com',
        password: '12345678',
        role: 'user',
        status: 'active',
        department: 'Operations',
        phone: '+1-800-OPER-001'
      },
      {
        first_name: 'Jane',
        last_name: 'Manager',
        username: 'manager',
        email: 'manager@supporttickets.com',
        password: '12345678',
        role: 'moderator',
        status: 'active',
        department: 'Management',
        phone: '+1-800-MNGR-001'
      }
    ];

    for (const testUser of testUsers) {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);

      const userInsertQuery = `
        INSERT INTO users (
          first_name,
          last_name,
          username,
          email,
          password,
          role,
          status,
          is_verified,
          department,
          phone,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO UPDATE SET 
          password = $5,
          role = $6,
          status = $7
        RETURNING id, username, email, role;
      `;

      const result = await query(userInsertQuery, [
        testUser.first_name,
        testUser.last_name,
        testUser.username,
        testUser.email,
        hashedPassword,
        testUser.role,
        testUser.status,
        true,
        testUser.department,
        testUser.phone,
        JSON.stringify({
          roleId: testUser.role === 'moderator' ? userRoleId : userRoleId,
          department: testUser.department
        })
      ]);

      const createdUser = result.rows[0];
      console.log(`✓ User created: ${createdUser.username}`);
      console.log(`  - Email: ${createdUser.email}`);
      console.log(`  - Password: ${testUser.password}`);
      console.log(`  - Role: ${createdUser.role}\n`);
    }

    console.log('✅ Admin and users seeded successfully!\n');
    console.log('📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN ACCOUNT:');
    console.log(`  Username: admin`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Email: admin@supporttickets.com`);
    console.log(`  Role: admin (${permissionIds.length} permissions)`);
    console.log('');
    console.log('TEST ACCOUNTS:');
    testUsers.forEach(user => {
      console.log(`  Username: ${user.username} | Password: ${user.password} | Role: ${user.role}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  }
};

module.exports = { seed };
