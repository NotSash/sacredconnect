/**
 * ===========================================
 * REVIEW CONTROLLER
 * ===========================================
 */

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Pandit = require('../models/Pandit');
const { paginationResponse } = require('../utils/helpers');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res, next) => {
    try {
        const {
            bookingId,
            overallRating,
            punctualityRating,
            knowledgeRating,
            behaviorRating,
            valueRating,
            title,
            reviewText
        } = req.body;
        
        // Validate
        if (!bookingId || !overallRating) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and rating are required'
            });
        }
        
        // Get booking
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Verify ownership
        if (booking.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking'
            });
        }
        
        // Check if booking is completed
        if (booking.status !== BOOKING_STATUS.COMPLETED) {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed bookings'
            });
        }
        
        // Check if already reviewed
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Booking has already been reviewed'
            });
        }
        
        // Create review
        const review = await Review.create({
            booking: bookingId,
            customer: req.user._id,
            pandit: booking.pandit,
            service: booking.service,
            overallRating,
            punctualityRating,
            knowledgeRating,
            behaviorRating,
            valueRating,
            title,
            reviewText,
            isVerifiedBooking: true
        });
        
        // Update booking with review reference
        booking.review = review._id;
        booking.customerRating = overallRating;
        await booking.save();
        
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews for a pandit
 * @route   GET /api/reviews/pandit/:panditId
 * @access  Public
 */
exports.getPanditReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, rating, sort = '-createdAt' } = req.query;
        
        const query = {
            pandit: req.params.panditId,
            isVisible: true
        };
        
        if (rating) {
            query.overallRating = parseInt(rating);
        }
        
        const total = await Review.countDocuments(query);
        
        const reviews = await Review.find(query)
            .populate('customer', 'fullName profilePhoto')
            .populate('service', 'name')
            .select('overallRating punctualityRating knowledgeRating behaviorRating valueRating title reviewText photos customer service createdAt panditResponse')
            .sort(sort)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        // Get rating breakdown
        const ratingBreakdown = await Review.aggregate([
            { $match: { pandit: require('mongoose').Types.ObjectId(req.params.panditId), isVisible: true } },
            { $group: { _id: '$overallRating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            ...paginationResponse(reviews, parseInt(page), parseInt(limit), total),
            ratingBreakdown: ratingBreakdown.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews for a service
 * @route   GET /api/reviews/service/:serviceId
 * @access  Public
 */
exports.getServiceReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const query = {
            service: req.params.serviceId,
            isVisible: true
        };
        
        const total = await Review.countDocuments(query);
        
        const reviews = await Review.find(query)
            .populate('customer', 'fullName profilePhoto')
            .populate('pandit', 'displayName')
            .select('overallRating title reviewText customer pandit createdAt')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            ...paginationResponse(reviews, parseInt(page), parseInt(limit), total)
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Respond to a review (Pandit)
 * @route   POST /api/reviews/:id/respond
 * @access  Private/Pandit
 */
exports.respondToReview = async (req, res, next) => {
    try {
        const { response } = req.body;
        
        if (!response) {
            return res.status(400).json({
                success: false,
                message: 'Response text is required'
            });
        }
        
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Verify pandit
        const pandit = await Pandit.findOne({ 
            _id: review.pandit, 
            user: req.user._id 
        });
        
        if (!pandit) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this review'
            });
        }
        
        review.panditResponse = {
            text: response,
            respondedAt: new Date()
        };
        
        await review.save();
        
        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            data: review.panditResponse
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Flag a review
 * @route   POST /api/reviews/:id/flag
 * @access  Private
 */
exports.flagReview = async (req, res, next) => {
    try {
        const { reason } = req.body;
        
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                isFlagged: true,
                flagReason: reason,
                flaggedBy: req.user._id,
                flaggedAt: new Date()
            },
            { new: true }
        );
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Review flagged for admin review'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my reviews (as a pandit)
 * @route   GET /api/reviews/my-reviews
 * @access  Private/Pandit
 */
exports.getMyReviews = async (req, res, next) => {
    try {
        const pandit = await Pandit.findOne({ user: req.user._id });
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        const { page = 1, limit = 10, responded } = req.query;
        
        const query = { pandit: pandit._id };
        
        if (responded === 'true') {
            query['panditResponse.text'] = { $exists: true };
        } else if (responded === 'false') {
            query['panditResponse.text'] = { $exists: false };
        }
        
        const total = await Review.countDocuments(query);
        
        const reviews = await Review.find(query)
            .populate('customer', 'fullName profilePhoto')
            .populate('service', 'name')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            ...paginationResponse(reviews, parseInt(page), parseInt(limit), total)
        });
        
    } catch (error) {
        next(error);
    }
};