const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../config/email');

// ============= SEND OTP for email verification =============
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

        await OTP.deleteMany({ email });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

        // Return OTP so frontend (EmailJS) can send it
        res.json({ success: true, otp });
    } catch (error) {
        console.error('❌ Send OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate OTP.' });
    }
});

// ============= VERIFY OTP for email verification =============
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = await OTP.findOne({ email, otp });
        if (!record || record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        await OTP.deleteMany({ email });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


router.post('/register', async(req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log('📝 Register attempt:', { name, email });

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        console.log('✅ User created:', { id: user._id, name: user.name, email: user.email });

        // Create token
        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============= LOGIN =============
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 Login attempt:', { email });

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('✅ User found:', { id: user._id, name: user.name });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password incorrect for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('✅ Login successful:', email);

        // Create token
        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============= GET CURRENT USER =============
router.get('/me', async(req, res) => {
    try {
        // Fixed: Remove optional chaining
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// ============= FORGOT PASSWORD — generate OTP (EmailJS sends it from frontend) =============
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email.' });
        }

        await OTP.deleteMany({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

        // Return OTP and user name so frontend (EmailJS) can send the email
        res.json({ success: true, otp, name: user.name });
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============= RESET PASSWORD — verify OTP + set new password =============
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const record = await OTP.findOne({ email, otp });
        if (!record || record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await OTP.deleteMany({ email });

        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
});

module.exports = router;