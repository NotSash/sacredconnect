/**
 * ===========================================
 * AUTH ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const {
    sendOTP,
    verifyOTP,
    register,
    registerPandit,
    getMe,
    logout,
    refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/register-pandit', registerPandit);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', protect, refreshToken);

module.exports = router;