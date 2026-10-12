
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

const app = express();

// Check required JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required.');
    process.exit(1);
}

// Configure CORS
app.use(cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map(x => x.trim()),
    credentials: true
}));

// Parse JSON requests
app.use(express.json({ limit: '8mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Authentication routes with rate limiting
app.use(
    '/api/auth',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    }),
    require('./routes/auth')
);

// Product routes
app.use('/api/products', require('./routes/products'));

// Order routes
app.use('/api/orders', require('./routes/orders'));

// AI routes with rate limiting
app.use(
    '/api/ai',
    rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 20
    }),
    require('./routes/ai')
);

// Upload routes
app.use('/api/uploads', require('./routes/uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1
            ? 'connected'
            : 'disconnected'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: 'Unexpected server error.'
    });
});

// Start the server
async function start() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected');

        // Read admin account details from environment variables
        const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const password = process.env.ADMIN_PASSWORD;

        // Create or update the initial admin account
        if (email && password) {
            const exists = await User.findOne({ email });

            if (!exists) {
                await User.create({
                    name: process.env.ADMIN_NAME || 'Store Admin',
                    email,
                    password: await bcrypt.hash(password, 12),
                    role: 'admin'
                });

                console.log('Initial admin account created:', email);

            } else if (exists.role !== 'admin') {
                exists.role = 'admin';

                await exists.save();

                console.log(
                    'Configured account promoted to admin:',
                    email
                );
            }
        }

        // Start listening on the configured port
        const port = process.env.PORT || 5000;

        app.listen(port, () => {
            console.log(`SP Fashion API listening on port ${port}`);
        });

    } catch (e) {
        console.error('Server startup failed:', e.message);

        process.exit(1);
    }
}

// Run the server
start();
