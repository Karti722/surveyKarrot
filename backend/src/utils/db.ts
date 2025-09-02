import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Add connection timeouts and pooling settings
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10, // Maximum number of clients in the pool
  min: 2   // Minimum number of clients in the pool
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    console.log('Database host:', process.env.DB_HOST);
    console.log('Database name:', process.env.DB_NAME);
    client.release(); // Release the test connection
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Connection details:');
    console.error('Host:', process.env.DB_HOST);
    console.error('Port:', process.env.DB_PORT);
    console.error('Database:', process.env.DB_NAME);
    console.error('User:', process.env.DB_USER);
    console.error('SSL enabled:', process.env.NODE_ENV === 'production');
    process.exit(1);
  }
};

export { pool, connectDB };