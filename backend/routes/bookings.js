/**
 * ===========================================
 * BOOKING ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBooking,
    cancelBooking,
    confirmBooking,
    completeBooking,
    getPanditBookings
} = require('../controllers/bookingController');
const { protect, isPandit } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', createBooking);
router.get('/', getMyBookings);

// Pandit routes (IMPORTANT: declare before /:id)
router.get('/pandit/all', isPandit, getPanditBookings);

// Booking by id
router.get('/:id', getBooking);
router.post('/:id/cancel', cancelBooking);

// Pandit actions on a booking
router.post('/:id/confirm', isPandit, confirmBooking);
router.post('/:id/complete', isPandit, completeBooking);

module.exports = router;