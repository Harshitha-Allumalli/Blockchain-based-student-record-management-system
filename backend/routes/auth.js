const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { usersDb, otpsDb, logsDb } = require('../db/supabase');

const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, role: user.role, studentId: user.studentId || null },
        process.env.JWT_SECRET || 'blockedu_secret_jwt_key_2026',
        { expiresIn: '7d' }
    );

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const cleanEmail = email.toLowerCase().trim();
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const message = `Hello,\n\nYour BlockEdu verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nThank you,\nBlockEdu Security Team`;

        // Check if user is already registered in SQLite
        const userExists = await usersDb.findByEmail(cleanEmail);
        if (userExists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Check rate limiting on OTPs
        const existingOtp = await otpsDb.findByEmail(cleanEmail);
        if (existingOtp && !existingOtp.isVerified) {
            const timeDiff = Date.now() - existingOtp.createdAt;
            if (timeDiff < 60000) {
                return res.status(429).json({ error: `Please wait ${Math.ceil((60000 - timeDiff)/1000)}s before requesting a new OTP.` });
            }
        }

        // Save OTP to SQLite DB
        await otpsDb.upsert(cleanEmail, otpCode);

        console.log('\n' + '='.repeat(50));
        console.log(`✉️  Sending OTP to ${cleanEmail}: ${otpCode}`);
        console.log('='.repeat(50) + '\n');

        try {
            await sendEmail({ email: cleanEmail, subject: 'BlockEdu - Your Verification Code', message });
            return res.status(200).json({ message: `Verification code sent to ${cleanEmail}! Please check your Inbox and Spam folder.` });
        } catch (emailErr) {
            console.error('Email delivery error:', emailErr.message);
            return res.status(500).json({ error: `Failed to send email: ${emailErr.message}` });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const cleanEmail = email.toLowerCase().trim();
        const cleanOtp = otp.trim();

        const validOtp = await otpsDb.findByEmail(cleanEmail);
        if (!validOtp || validOtp.otp !== cleanOtp || (Date.now() - validOtp.createdAt > 300000)) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        await otpsDb.setVerified(cleanEmail);
        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, studentId } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existing = await usersDb.findByEmail(cleanEmail);
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const verifiedOtp = await otpsDb.findByEmail(cleanEmail);
        if (!verifiedOtp || !verifiedOtp.isVerified) {
            return res.status(400).json({ error: 'Email has not been verified.' });
        }

        // Save user to SQLite DB
        await usersDb.create({ name, email: cleanEmail, password, role: role || 'student', studentId, isVerified: 1 });
        await otpsDb.delete(cleanEmail);

        await logsDb.add({
            action: 'register',
            actor: cleanEmail,
            target: cleanEmail,
            details: 'New user registered',
            severity: 'info'
        });

        res.status(201).json({ message: 'Registration successful. You can now log in.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const user = await usersDb.findByEmail(cleanEmail);

        if (user && user.password === password) {
            await logsDb.add({ action: 'login', actor: cleanEmail, details: 'User logged in', severity: 'info' });
            const token = signToken(user);
            return res.json({
                token,
                user: { id: user.id, name: user.name, email: cleanEmail, role: user.role, studentId: user.studentId }
            });
        }

        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const cleanEmail = email.toLowerCase().trim();
        const user = await usersDb.findByEmail(cleanEmail);
        if (!user) {
            return res.status(404).json({ error: 'No account registered with this email address.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const message = `Hello ${user.name || ''},\n\nYour BlockEdu password reset verification code is: ${otpCode}\n\nThis code will expire in 5 minutes. If you did not request a password reset, please ignore this message.\n\nThank you,\nBlockEdu Security Team`;

        // Check rate limiting
        const existingOtp = await otpsDb.findByEmail(cleanEmail);
        if (existingOtp) {
            const timeDiff = Date.now() - existingOtp.createdAt;
            if (timeDiff < 60000) {
                return res.status(429).json({ error: `Please wait ${Math.ceil((60000 - timeDiff)/1000)}s before requesting a new code.` });
            }
        }

        await otpsDb.upsert(cleanEmail, otpCode);

        console.log('\n' + '='.repeat(50));
        console.log(`🔐 Forgot Password OTP sent to ${cleanEmail}: ${otpCode}`);
        console.log('='.repeat(50) + '\n');

        try {
            await sendEmail({ email: cleanEmail, subject: 'BlockEdu - Password Reset Code', message });
            return res.status(200).json({ message: `Verification code sent to ${cleanEmail}. Check your inbox/spam.` });
        } catch (emailErr) {
            console.error('Email delivery error:', emailErr.message);
            return res.status(500).json({ error: `Failed to send email: ${emailErr.message}` });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanOtp = otp.trim();

        const user = await usersDb.findByEmail(cleanEmail);
        if (!user) return res.status(404).json({ error: 'User account not found.' });

        const validOtp = await otpsDb.findByEmail(cleanEmail);
        if (!validOtp || validOtp.otp !== cleanOtp || (Date.now() - validOtp.createdAt > 300000)) {
            return res.status(400).json({ error: 'Invalid or expired verification code.' });
        }

        await usersDb.updatePassword(cleanEmail, newPassword);
        await otpsDb.delete(cleanEmail);

        await logsDb.add({
            action: 'password_reset',
            actor: cleanEmail,
            target: cleanEmail,
            details: 'User reset their password via email OTP verification',
            severity: 'info'
        });

        res.status(200).json({ message: 'Password reset successfully! You can now log in with your new password.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
