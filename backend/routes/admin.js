const express = require('express');
const router  = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { db, usersDb, logsDb } = require('../db/sqlite');

// ─── Helper: promisified db.all / db.run ────────────────────────────────────
const dbAll = (sql, params = []) =>
    new Promise((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows || [])));

const dbRun = (sql, params = []) =>
    new Promise((res, rej) => db.run(sql, params, function(err) { err ? rej(err) : res(this); }));

const dbGet = (sql, params = []) =>
    new Promise((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row)));

// ─── GET /api/admin/faculty ──────────────────────────────────────────────────
router.get('/faculty', protect, requireRole('admin'), async (req, res) => {
    try {
        const rows = await dbAll(
            `SELECT id, name, email, role, createdAt FROM users WHERE role = 'faculty' ORDER BY createdAt DESC`
        );
        res.json({ success: true, count: rows.length, faculty: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/admin/faculty ─────────────────────────────────────────────────
router.post('/faculty', protect, requireRole('admin'), async (req, res) => {
    try {
        const { name, email, password, phone, department, designation } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required.' });
        }

        const cleanEmail = email.toLowerCase().trim();

        const existing = await usersDb.findByEmail(cleanEmail);
        if (existing) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }

        await usersDb.create({
            name,
            email: cleanEmail,
            password,
            role: 'faculty',
            isVerified: 1
        });

        await logsDb.add({
            action: 'faculty_added',
            actor: req.user.email,
            target: cleanEmail,
            details: `Faculty ${name} added. Dept: ${department || 'N/A'}, Designation: ${designation || 'N/A'}`,
            severity: 'info'
        });

        res.status(201).json({
            success: true,
            message: `Faculty member "${name}" added successfully.`,
            faculty: { name, email: cleanEmail, role: 'faculty' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── DELETE /api/admin/faculty/:id ──────────────────────────────────────────
router.delete('/faculty/:id', protect, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const user = await dbGet(
            `SELECT * FROM users WHERE id = ? AND role = 'faculty'`, [id]
        );

        if (!user) return res.status(404).json({ error: 'Faculty member not found.' });

        await dbRun(`DELETE FROM users WHERE id = ? AND role = 'faculty'`, [id]);

        await logsDb.add({
            action: 'faculty_deleted',
            actor: req.user.email,
            target: user.email,
            details: `Faculty member ${user.name} removed by admin.`,
            severity: 'warning'
        });

        res.json({ success: true, message: `Faculty member "${user.name}" removed successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
