"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
    min: 2
});
exports.pool = pool;
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        console.log('Database host:', process.env.DB_HOST);
        console.log('Database name:', process.env.DB_NAME);
        client.release();
    }
    catch (error) {
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
exports.connectDB = connectDB;
