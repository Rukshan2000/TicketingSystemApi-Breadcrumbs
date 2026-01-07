const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST ,
  port: process.env.DB_PORT ,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME ,
  password: process.env.DB_PASSWORD ,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    client.release();
    return pool;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = { connectDB, pool, query };
