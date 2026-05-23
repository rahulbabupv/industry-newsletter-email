// Load environment variables from the .env file into process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import our route handlers
const articlesRouter = require('./routes/articles');
const newsletterRouter = require('./routes/newsletter');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ── Rate limiting ───────────────────────────────────────────
// 10 requests per 20 minutes per IP on the expensive AI routes
const apiLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,  // 20 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. You can make up to 10 requests every 20 minutes. Please wait and try again.',
  },
});

// ── Routes ──────────────────────────────────────────────────
// Articles: fetch news + generate AI summaries
app.use('/api/articles', apiLimiter, articlesRouter);

// Newsletter: generate final newsletter from selected articles
app.use('/api/newsletter', apiLimiter, newsletterRouter);

// Simple health-check so you can verify the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Newsletter backend is running!' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.');
});
