const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost', // PostgreSQL host
  user: process.env.DB_USER || 'ypur-username', // PostgreSQL username
  password: process.env.DB_PASSWORD || 'password', // PostgreSQL password
  database: process.env.DB_DATABASE || 'course-selling', // PostgreSQL database name
  port: process.env.DB_PORT || 5432, // PostgreSQL port (default is 5432)
});

// Connect to PostgreSQL database using pool
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
    return;
  }
  
  console.log('Connected to PostgreSQL database');
  release();
});

module.exports = pool;
