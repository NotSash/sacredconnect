/**
 * ===========================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ===========================================
 */

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = { message, statusCode: 400 };
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        error = { message, statusCode: 400 };
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again.';
        error = { message, statusCode: 401 };
    }
    
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again.';
        error = { message, statusCode: 401 };
    }
    
    // Multer file upload errors
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File is too large. Maximum size is 5MB';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files. Maximum is 10 files';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        }
        
        error = { message, statusCode: 400 };
    }
    
    // Send response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    });
};

module.exports = errorHandler;