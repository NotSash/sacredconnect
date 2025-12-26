/**
 * ===========================================
 * SERVICE ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    getFeaturedServices,
    getPopularServices,
    searchServices,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getServices);
router.get('/featured', getFeaturedServices);
router.get('/popular', getPopularServices);
router.get('/search', searchServices);
router.get('/:slug', getService);

// Admin routes
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;