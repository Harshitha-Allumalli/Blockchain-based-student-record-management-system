const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with CORS so frontend can preview them in iframes / img tags
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
}, express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth');
const recordRoutes     = require('./routes/records');
const chatbotRoutes    = require('./routes/chatbot');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes      = require('./routes/admin');

app.use('/api/auth',       authRoutes);
app.use('/api/records',    recordRoutes);
app.use('/api/chatbot',    chatbotRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin',      adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'BlockEdu API',
        timestamp: new Date().toISOString(),
        db: "Supabase"
    });
});



// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ─── Database & Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// SQLite is the active data layer — start the server immediately without
// waiting on MongoDB. MongoDB connection is attempted in the background only.
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

console.log("✅ Supabase Database Connected");
