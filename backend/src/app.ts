// (logger middleware moved below app declaration)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import surveyRoutes from './routes/surveyRoutes';

const app = express();

// Global request logger (must be after app is declared)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Survey App Backend',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', surveyRoutes);

export default app;