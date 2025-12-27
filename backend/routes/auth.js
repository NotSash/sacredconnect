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
// Primary (documented) endpoints
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Backward/alternate spellings (prevent 404s if older client/backend uses different naming)
router.post('/sendOtp', sendOTP);
router.post('/sendOTP', sendOTP);
router.post('/send_otp', sendOTP);
router.post('/verifyOtp', verifyOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/verify_otp', verifyOTP);

router.post('/register', register);
router.post('/register-pandit', registerPandit);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', protect, refreshToken);

module.exports = router;