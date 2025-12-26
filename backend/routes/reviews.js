/**
 * ===========================================
 * REVIEW ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const {
    createReview,
    getPanditReviews,
    getServiceReviews,
    respondToReview,
    flagReview,
    getMyReviews
} = require('../controllers/reviewController');
const { protect, isPandit } = require('../middleware/auth');
const { uploadReviewPhotos, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/pandit/:panditId', getPanditReviews);
router.get('/service/:serviceId', getServiceReviews);

// Protected routes
router.post('/', protect, uploadReviewPhotos, handleUploadError, createReview);
router.post('/:id/flag', protect, flagReview);

// Pandit routes
router.get('/my-reviews', protect, isPandit, getMyReviews);
router.post('/:id/respond', protect, isPandit, respondToReview);

module.exports = router;