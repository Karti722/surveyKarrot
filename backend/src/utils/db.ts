import { Pool } from 'pg';
import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.resolve(__dirname, '../../.env')});

const pool = new Pool (
    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized : false } : false,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 10,
        min: 2
    });

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("database successfully connected")
    }
    catch (error) {
        console.log("Database connection failed");
        console.error(error);
    }
}



export {pool , connectDB };
