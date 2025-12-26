/**
 * ===========================================
 * PANDIT ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const {
    getPandits,
    getPandit,
    getFeaturedPandits,
    getMyProfile,
    updateMyProfile,
    addService,
    removeService,
    updateBankDetails,
    getMyStats,
    verifyPandit
} = require('../controllers/panditController');
const { protect, authorize, isPandit } = require('../middleware/auth');
const { uploadProfilePhoto, uploadGallery, uploadDocument, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getPandits);
router.get('/featured', getFeaturedPandits);

// Pandit routes (require pandit role) - IMPORTANT: declare before /:id
router.get('/me/profile', protect, isPandit, getMyProfile);
router.put('/me/profile', protect, isPandit, updateMyProfile);
router.get('/me/stats', protect, isPandit, getMyStats);
router.post('/me/services', protect, isPandit, addService);
router.delete('/me/services/:serviceId', protect, isPandit, removeService);
router.put('/me/bank-details', protect, isPandit, updateBankDetails);

// Public route by id
router.get('/:id', getPandit);

// Photo uploads
router.post('/me/photo', protect, isPandit, uploadProfilePhoto, handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { profilePhoto: req.file.path });
        
        res.status(200).json({
            success: true,
            data: { url: req.file.path }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/me/gallery', protect, isPandit, uploadGallery, handleUploadError, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        
        const Pandit = require('../models/Pandit');
        const photos = req.files.map(file => ({
            url: file.path,
            caption: ''
        }));
        
        await Pandit.findOneAndUpdate(
            { user: req.user._id },
            { $push: { gallery: { $each: photos } } }
        );
        
        res.status(200).json({
            success: true,
            data: { urls: req.files.map(f => f.path) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/me/documents', protect, isPandit, uploadDocument, handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const { documentType } = req.body; // 'aadhar', 'pan', 'certificate'
        
        const Pandit = require('../models/Pandit');
        const updateField = documentType === 'aadhar' 
            ? { 'documents.aadhar.document': req.file.path }
            : documentType === 'pan'
            ? { 'documents.pan.document': req.file.path }
            : null;
        
        if (updateField) {
            await Pandit.findOneAndUpdate({ user: req.user._id }, updateField);
        }
        
        res.status(200).json({
            success: true,
            data: { url: req.file.path }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin routes
router.put('/:id/verify', protect, authorize('admin'), verifyPandit);

module.exports = router;