/**
 * ===========================================
 * FILE UPLOAD MIDDLEWARE (Cloudinary)
 * ===========================================
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const msc = require('multer-storage-cloudinary');
const { UPLOAD } = require('../config/constants');

// Support multiple export styles (CJS / ESM / version differences)
let CloudinaryStorage = null;
try {
    CloudinaryStorage = msc.CloudinaryStorage || msc.default || msc;
    // Some builds may nest it
    if (CloudinaryStorage && CloudinaryStorage.CloudinaryStorage) {
        CloudinaryStorage = CloudinaryStorage.CloudinaryStorage;
    }
} catch (_) {
    CloudinaryStorage = null;
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Create Cloudinary storage for different purposes
 */
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
    if (typeof CloudinaryStorage !== 'function') {
        // Fail fast with a clear message (prevents confusing runtime crashes)
        throw new Error(
            'CloudinaryStorage is not available. Check multer-storage-cloudinary installation/version. ' +
            'Try: npm i multer-storage-cloudinary@4 or ensure require("multer-storage-cloudinary").CloudinaryStorage exists.'
        );
    }

    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `sacredconnect/${folder}`,
            allowed_formats: allowedFormats,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        }
    });
};

/**
 * File filter
 */
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
};

/**
 * Profile photo upload
 */
exports.uploadProfilePhoto = multer({
    storage: createStorage('profiles'),
    limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE
    },
    fileFilter
}).single('profilePhoto');

/**
 * Gallery upload (multiple images)
 */
exports.uploadGallery = multer({
    storage: createStorage('gallery'),
    limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE,
        files: UPLOAD.MAX_GALLERY_IMAGES
    },
    fileFilter
}).array('gallery', UPLOAD.MAX_GALLERY_IMAGES);

/**
 * Document upload (Aadhar, PAN, certificates)
 */
exports.uploadDocument = multer({
    storage: createStorage('documents', ['jpg', 'jpeg', 'png', 'pdf']),
    limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE
    },
    fileFilter
}).single('document');

/**
 * Review photos upload
 */
exports.uploadReviewPhotos = multer({
    storage: createStorage('reviews'),
    limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE,
        files: 5
    },
    fileFilter
}).array('photos', 5);

/**
 * Service/Category image upload
 */
exports.uploadServiceImage = multer({
    storage: createStorage('services'),
    limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE
    },
    fileFilter
}).single('image');

/**
 * Delete file from Cloudinary
 */
exports.deleteFile = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return false;
    }
};

/**
 * Get public ID from Cloudinary URL
 */
exports.getPublicIdFromUrl = (url) => {
    if (!url) return null;
    
    // Extract public ID from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.ext
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
};

/**
 * Handle upload errors
 */
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files'
            });
        }
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error'
        });
    }
    
    next();
};

// Export cloudinary instance for direct use
exports.cloudinary = cloudinary;