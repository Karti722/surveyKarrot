import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import app from './app';
import { pool } from './utils/db';
import { createSurveyTables } from './utils/setupSurveyTables';

const PORT = Number(process.env.PORT) || 5000;

// Start the server first, then attempt database connection
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Ensure server stays alive
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process
});

// Attempt database connection after server starts
const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    console.log('Database details:');
    console.log('- Host:', process.env.DB_HOST);
    console.log('- Database:', process.env.DB_NAME);
    console.log('- User:', process.env.DB_USER);
    console.log('- SSL:', process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled');
    client.release();
    
    // Create survey tables after successful connection
    await createSurveyTables();
  } catch (err: Error | any) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Connection string details:');
    console.error('- Host:', process.env.DB_HOST);
    console.error('- Port:', process.env.DB_PORT);
    console.error('- Database:', process.env.DB_NAME);
    console.error('- User:', process.env.DB_USER);
    
    // Don't exit the process, just log the error
    console.error('⚠️  Server will continue running without database connection');
    console.error('Please check your Supabase configuration and environment variables');
  }
};

// Try to connect to database
connectToDatabase();