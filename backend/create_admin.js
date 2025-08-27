const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createAdmin = async () => {
  const username = 'admin';
  const password = 'admin';

  try {
    // Check if admin already exists
    const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      console.log('Admin user already exists.');
      pool.end();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, TRUE)',
      [username, hashedPassword]
    );
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    pool.end();
  }
};

createAdmin();
