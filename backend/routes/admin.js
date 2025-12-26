/**
 * ===========================================
 * ADMIN ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getPendingPandits, approvePandit, rejectPandit } = require('../controllers/adminController');

// All admin routes are protected
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/pandits/pending', getPendingPandits);
router.put('/pandits/:id/approve', approvePandit);
router.put('/pandits/:id/reject', rejectPandit);

module.exports = router;