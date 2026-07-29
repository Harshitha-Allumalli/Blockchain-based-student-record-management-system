const express = require('express');
const router = express.Router();

const { protect, requireRole } = require('../middleware/auth');
const { usersDb, logsDb } = require('../db/supabase');
const supabase = require('../config/supabase');

// ─── GET /api/admin/faculty ──────────────────────────────────────────────
router.get('/faculty', protect, requireRole('admin'), async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('users')
            .select('id,name,email,role,createdAt')
            .eq('role', 'faculty')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            count: data.length,
            faculty: data
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ─── POST /api/admin/faculty ─────────────────────────────────────────────
router.post('/faculty', protect, requireRole('admin'), async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            department,
            designation
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email and password are required.'
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const existing = await usersDb.findByEmail(cleanEmail);

        if (existing) {
            return res.status(400).json({
                error: 'A user with this email already exists.'
            });
        }

        await usersDb.create({
            name,
            email: cleanEmail,
            password,
            role: 'faculty',
            isVerified: true
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
            faculty: {
                name,
                email: cleanEmail,
                role: 'faculty'
            }
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});


// ─── DELETE /api/admin/faculty/:id ───────────────────────────────────────
router.delete('/faculty/:id', protect, requireRole('admin'), async (req, res) => {

    try {

        const { id } = req.params;

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .eq('role', 'faculty')
            .single();

        if (fetchError || !user) {
            return res.status(404).json({
                error: 'Faculty member not found.'
            });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .eq('role', 'faculty');

        if (error) throw error;

        await logsDb.add({
            action: 'faculty_deleted',
            actor: req.user.email,
            target: user.email,
            details: `Faculty member ${user.name} removed by admin.`,
            severity: 'warning'
        });

        res.json({
            success: true,
            message: `Faculty member "${user.name}" removed successfully.`
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;
