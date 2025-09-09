"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '.env') });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./utils/db");
const setupSurveyTables_1 = require("./utils/setupSurveyTables");
const PORT = Number(process.env.PORT) || 5000;
const server = app_1.default.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Server listening on http://localhost:${PORT}`);
});
server.on('error', (error) => {
    console.error('Server error:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
const connectToDatabase = async () => {
    try {
        const client = await db_1.pool.connect();
        console.log('✅ Database connected successfully');
        console.log('Database details:');
        console.log('- Host:', process.env.DB_HOST);
        console.log('- Database:', process.env.DB_NAME);
        console.log('- User:', process.env.DB_USER);
        console.log('- SSL:', process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled');
        client.release();
        await (0, setupSurveyTables_1.createSurveyTables)();
    }
    catch (err) {
        console.error('❌ Database connection failed:');
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        console.error('Connection string details:');
        console.error('- Host:', process.env.DB_HOST);
        console.error('- Port:', process.env.DB_PORT);
        console.error('- Database:', process.env.DB_NAME);
        console.error('- User:', process.env.DB_USER);
        console.error('⚠️  Server will continue running without database connection');
        console.error('Please check your Supabase configuration and environment variables');
    }
};
connectToDatabase();
