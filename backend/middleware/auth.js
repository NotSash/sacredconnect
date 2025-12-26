/**
 * ===========================================
 * AUTHENTICATION MIDDLEWARE
 * ===========================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - require authentication
 */
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Check if user is active
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Your account has been suspended. Please contact support.'
                });
            }
            
            // Attach user to request
            req.user = user;
            next();
            
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Invalid token.'
            });
        }
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Optional authentication - doesn't require token but attaches user if present
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                if (user && user.status === 'active') {
                    req.user = user;
                }
            } catch (error) {
                // Token invalid, but continue without user
            }
        }
        
        next();
        
    } catch (error) {
        next();
    }
};

/**
 * Authorize specific roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        
        next();
    };
};

/**
 * Check if user is the owner of a resource
 */
exports.isOwner = (model, userField = 'user') => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
            
            // Check ownership (or admin)
            const ownerId = resource[userField]?.toString() || resource[userField];
            const userId = req.user._id.toString();
            
            if (ownerId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource'
                });
            }
            
            req.resource = resource;
            next();
            
        } catch (error) {
            console.error('isOwner middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    };
};

/**
 * Check if user is a verified pandit
 */
exports.isPandit = async (req, res, next) => {
    try {
        if (req.user.role !== 'pandit') {
            return res.status(403).json({
                success: false,
                message: 'Only pandits can access this route'
            });
        }
        
        const Pandit = require('../models/Pandit');
        const pandit = await Pandit.findOne({ user: req.user._id });
        
        if (!pandit) {
            return res.status(403).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        if (pandit.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your pandit profile is not active. Please complete verification.'
            });
        }
        
        req.pandit = pandit;
        next();
        
    } catch (error) {
        console.error('isPandit middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Check if user is an admin
 */
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Only admins can access this route'
        });
    }
    next();
};