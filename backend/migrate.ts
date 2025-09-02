import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runMigration(file: string) {
  const sql = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
  try {
    await pool.query(sql);
    console.log(`Migration ${file} applied successfully.`);
  } catch (err: any) {
    console.error(`Migration ${file} failed:`, err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration file passed as an argument
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Please provide a migration file path.');
  process.exit(1);
}
runMigration(migrationFile);
