const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const tokenFor = u =>
    jwt.sign(
        { id: u._id, role: u.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

const safe = u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required.'
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        const normalized = email.toLowerCase().trim();

        if (await User.exists({ email: normalized })) {
            return res.status(409).json({
                message: 'An account with this email already exists.'
            });
        }

        const user = await User.create({
            name,
            email: normalized,
            password: await bcrypt.hash(password, 12),
            role: 'customer'
        });

        res.status(201).json({
            token: tokenFor(user),
            user: safe(user)
        });

    } catch (e) {
        res.status(500).json({
            message: 'Could not create account.'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: String(email || '').toLowerCase().trim()
        }).select('+password');

        if (
            !user ||
            !await bcrypt.compare(password || '', user.password)
        ) {
            return res.status(401).json({
                message: 'Email or password is incorrect.'
            });
        }

        res.json({
            token: tokenFor(user),
            user: safe(user)
        });

    } catch (e) {
        res.status(500).json({
            message: 'Could not login.'
        });
    }
});

router.get('/me', protect, (req, res) => {
    res.json({
        user: safe(req.user)
    });
});

module.exports = router;