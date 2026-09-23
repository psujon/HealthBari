import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initMySQL } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env automatically from current working dir, server/.env, or root .env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Initialize MySQL Database (healthbari) with auto-table creation & seeding
initMySQL();

// =========================================================
// 🌐 BULLETPROOF CORS CONFIGURATION FOR CROSS-ORIGIN APIS
// =========================================================
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'Pragma'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsing Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static route for serving uploaded images
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/health-tips', articleRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    databaseEngine: 'MySQL',
    databaseName: process.env.DB_NAME || 'healthbari',
    message: 'হেলথ বাড়ি (HealthBari) MySQL REST API Server is running smoothly!'
  });
});

// Production Setup: Serve React Frontend directly from /public_html
const publicHtmlPath = path.resolve(__dirname, '../public_html');

// Serve static assets from public_html
app.use(express.static(publicHtmlPath));

// Fallback for SPA (Single Page Application) routing
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    return next();
  }

  const indexPath = path.join(publicHtmlPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('HealthBari Server is running.');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [HealthBari Live Server] active on port ${PORT} (0.0.0.0:${PORT} & 127.0.0.1:${PORT})`);
  console.log(`🩺 Database Engine: MySQL (Database: ${process.env.DB_NAME || 'healthbari'})`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
