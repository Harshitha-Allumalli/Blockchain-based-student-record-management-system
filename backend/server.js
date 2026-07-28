const express = require('express');
const mongoose = require('mongoose');
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
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ─── Default User Seeding Function ───────────────────────────────────────────
const seedDefaultUsers = async () => {
    try {
        const User = require('./models/User');
        const adminExists = await User.findOne({ email: 'admin@blockedu.com' });
        if (!adminExists) {
            await User.create({ name: 'System Admin', email: 'admin@blockedu.com', password: 'admin123', role: 'admin', isVerified: true });
            console.log('🌱 Seeded default admin user: admin@blockedu.com');
        }
        const verifierExists = await User.findOne({ email: 'verifier@blockedu.com' });
        if (!verifierExists) {
            await User.create({ name: 'Verifier HR', email: 'verifier@blockedu.com', password: 'verify123', role: 'verifier', isVerified: true });
            console.log('🌱 Seeded default verifier user: verifier@blockedu.com');
        }
        const facultyExists = await User.findOne({ email: 'faculty@blockedu.com' });
        if (!facultyExists) {
            await User.create({ name: 'Dr. Alan Turing', email: 'faculty@blockedu.com', password: 'faculty123', role: 'faculty', isVerified: true });
            console.log('🌱 Seeded default faculty user: faculty@blockedu.com');
        }
        const studentExists = await User.findOne({ email: 'student@blockedu.com' });
        if (!studentExists) {
            await User.create({ name: 'Alice Smith', email: 'student@blockedu.com', password: 'student123', role: 'student', studentId: 'STU101', isVerified: true });
            console.log('🌱 Seeded default student user: student@blockedu.com');
        }
    } catch (e) {
        console.error('Seeding error:', e.message);
    }
};

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

// Attempt MongoDB in background (non-blocking) — only used if routes import Mongoose models
mongoose.set('bufferCommands', false);
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
        .then(async () => {
            console.log('✅ MongoDB connected');
            await seedDefaultUsers();
        })
        .catch(err => {
            console.warn('⚠️  MongoDB unavailable, running on SQLite only:', err.message);
        });
}
