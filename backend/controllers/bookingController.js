/**
 * ===========================================
 * BOOKING CONTROLLER
 * ===========================================
 */

const Booking = require('../models/Booking');
const Pandit = require('../models/Pandit');
const Service = require('../models/Service');
const User = require('../models/User');
const { paginationResponse, formatCurrency, formatDate } = require('../utils/helpers');
const { sendTemplateEmail } = require('../utils/email');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../config/constants');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res, next) => {
    try {
        const {
            panditId,
            serviceId,
            date,
            startTime,
            duration,
            venueType,
            venue,
            specialInstructions,
            sankalpDetails,
            pujaFor,
            addOns,
            samagriOption
        } = req.body;
        
        // Validate required fields
        if (!panditId || !serviceId || !date || !startTime) {
            return res.status(400).json({
                success: false,
                message: 'Pandit, service, date, and time are required'
            });
        }
        
        // Get pandit and validate
        const pandit = await Pandit.findById(panditId);
        if (!pandit || pandit.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found or not available'
            });
        }
        
        // Get service
        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        // Find pandit's pricing for this service
        const panditService = pandit.services.find(
            s => s.service.toString() === serviceId && s.isActive
        );
        
        if (!panditService) {
            return res.status(400).json({
                success: false,
                message: 'Pandit does not offer this service'
            });
        }
        
        // Check availability (basic check - can be enhanced)
        const bookingDate = new Date(date);
        const existingBooking = await Booking.findOne({
            pandit: panditId,
            date: bookingDate,
            startTime,
            status: { $nin: ['cancelled', 'no_show'] }
        });
        
        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Pandit is not available at this time slot'
            });
        }
        
        // Calculate pricing
        const basePrice = panditService.price;
        const addOnsTotal = (addOns || []).reduce((sum, addon) => sum + (addon.price || 0), 0);
        
        // Get samagri price
        let samagriPrice = 0;
        if (samagriOption && samagriOption !== 'self_arranged') {
            const kit = service.samagriKits?.find(k => k.type === samagriOption.replace('_kit', ''));
            samagriPrice = kit?.price || 0;
        }
        
        // Calculate travel charge (simplified)
        let travelCharge = 0;
        // Can add distance-based calculation here
        
        // Create booking
        const booking = await Booking.create({
            customer: req.user._id,
            pandit: panditId,
            service: serviceId,
            date: bookingDate,
            startTime,
            duration: duration || panditService.duration || service.duration.min,
            venueType: venueType || 'customer_home',
            venue,
            specialInstructions,
            sankalpDetails,
            pujaFor,
            addOns: addOns || [],
            samagriOption: samagriOption || 'self_arranged',
            pricing: {
                basePrice,
                addOnsTotal,
                samagriPrice,
                travelCharge,
                discount: 0,
                convenienceFee: 0,
                taxAmount: 0,
                totalAmount: 0,
                advanceAmount: 0,
                balanceAmount: 0
            },
            status: BOOKING_STATUS.PENDING,
            paymentStatus: PAYMENT_STATUS.PENDING,
            source: 'web'
        });
        
        // Calculate full pricing
        booking.calculatePricing();
        await booking.calculatePanditPayout();
        await booking.save();
        
        // Send notification to pandit (email/push)
        // TODO: Implement push notifications
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                bookingId: booking._id,
                bookingNumber: booking.bookingNumber,
                pricing: booking.pricing,
                status: booking.status
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getMyBookings = async (req, res, next) => {
    try {
        const {
            status,
            upcoming,
            past,
            page = 1,
            limit = 10
        } = req.query;
        
        const query = { customer: req.user._id };
        
        // Status filter
        if (status) {
            query.status = status;
        }
        
        // Upcoming bookings
        if (upcoming === 'true') {
            query.date = { $gte: new Date() };
            query.status = { $in: ['pending', 'confirmed'] };
        }
        
        // Past bookings
        if (past === 'true') {
            query.$or = [
                { date: { $lt: new Date() } },
                { status: { $in: ['completed', 'cancelled'] } }
            ];
        }
        
        const total = await Booking.countDocuments(query);
        
        const bookings = await Booking.find(query)
            .populate('pandit', 'displayName user')
            .populate('service', 'name slug icon')
            .populate({
                path: 'pandit',
                populate: { path: 'user', select: 'profilePhoto phone' }
            })
            .select('bookingNumber date startTime duration venue pricing status paymentStatus createdAt')
            .sort({ date: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        const formattedBookings = bookings.map(b => ({
            id: b._id,
            bookingNumber: b.bookingNumber,
            serviceName: b.service?.name,
            serviceIcon: b.service?.icon,
            panditName: b.pandit?.displayName,
            panditPhoto: b.pandit?.user?.profilePhoto,
            date: b.date,
            time: b.startTime,
            duration: b.duration,
            venue: b.venue?.address?.city || b.venue?.address?.locality,
            totalAmount: b.pricing?.totalAmount,
            status: b.status,
            paymentStatus: b.paymentStatus,
            createdAt: b.createdAt
        }));
        
        res.status(200).json({
            success: true,
            ...paginationResponse(formattedBookings, parseInt(page), parseInt(limit), total)
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('pandit', 'displayName user languages baseCity')
            .populate('service', 'name slug icon description inclusions')
            .populate({
                path: 'pandit',
                populate: { path: 'user', select: 'fullName profilePhoto phone email' }
            })
            .populate('review');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is authorized to view
        const isCustomer = booking.customer.toString() === req.user._id.toString();
        const isPandit = await Pandit.findOne({ 
            _id: booking.pandit._id, 
            user: req.user._id 
        });
        const isAdmin = req.user.role === 'admin';
        
        if (!isCustomer && !isPandit && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }
        
        res.status(200).json({
            success: true,
            data: booking
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel booking
 * @route   POST /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res, next) => {
    try {
        const { reason } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is authorized
        if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }
        
        // Check if can be cancelled
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Booking cannot be cancelled. Current status: ${booking.status}`
            });
        }
        
        // Update booking
        booking.status = BOOKING_STATUS.CANCELLED;
        booking.cancelledAt = new Date();
        booking.cancelledBy = 'customer';
        booking.cancellationReason = reason;
        
        // Calculate refund (if payment was made)
        if (booking.paymentStatus !== PAYMENT_STATUS.PENDING) {
            const hoursUntilBooking = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);
            
            if (hoursUntilBooking > 48) {
                // Full refund
                booking.refund = {
                    amount: booking.pricing.advanceAmount,
                    status: 'pending'
                };
            } else if (hoursUntilBooking > 24) {
                // 50% refund
                booking.refund = {
                    amount: Math.round(booking.pricing.advanceAmount * 0.5),
                    status: 'pending'
                };
            } else {
                // No refund
                booking.refund = {
                    amount: 0,
                    status: 'not_applicable'
                };
            }
        }
        
        await booking.save();
        
        // TODO: Send cancellation notifications
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                bookingNumber: booking.bookingNumber,
                status: booking.status,
                refund: booking.refund
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Confirm booking (Pandit)
 * @route   POST /api/bookings/:id/confirm
 * @access  Private/Pandit
 */
exports.confirmBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Verify pandit owns this booking
        const pandit = await Pandit.findOne({ 
            _id: booking.pandit, 
            user: req.user._id 
        });
        
        if (!pandit && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to confirm this booking'
            });
        }
        
        if (booking.status !== BOOKING_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: `Cannot confirm booking with status: ${booking.status}`
            });
        }
        
        booking.status = BOOKING_STATUS.CONFIRMED;
        booking.confirmedAt = new Date();
        await booking.save();
        
        // Send confirmation email to customer
        const customer = await User.findById(booking.customer);
        const service = await Service.findById(booking.service);
        
        if (customer?.email) {
            await sendTemplateEmail(customer.email, 'bookingConfirmation', {
                bookingNumber: booking.bookingNumber,
                serviceName: service?.name,
                panditName: pandit?.displayName,
                date: formatDate(booking.date),
                time: booking.startTime,
                location: booking.venue?.address?.city || 'Your location',
                totalAmount: booking.pricing?.totalAmount
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: {
                bookingNumber: booking.bookingNumber,
                status: booking.status
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark booking as completed (Pandit)
 * @route   POST /api/bookings/:id/complete
 * @access  Private/Pandit
 */
exports.completeBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Verify pandit
        const pandit = await Pandit.findOne({ 
            _id: booking.pandit, 
            user: req.user._id 
        });
        
        if (!pandit && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.IN_PROGRESS) {
            return res.status(400).json({
                success: false,
                message: `Cannot complete booking with status: ${booking.status}`
            });
        }
        
        booking.status = BOOKING_STATUS.COMPLETED;
        booking.completedAt = new Date();
        await booking.save();
        
        // Update pandit stats
        await pandit.updateStats();
        
        res.status(200).json({
            success: true,
            message: 'Booking marked as completed',
            data: {
                bookingNumber: booking.bookingNumber,
                status: booking.status
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get pandit's bookings
 * @route   GET /api/bookings/pandit
 * @access  Private/Pandit
 */
exports.getPanditBookings = async (req, res, next) => {
    try {
        const pandit = await Pandit.findOne({ user: req.user._id });
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        const {
            status,
            upcoming,
            past,
            page = 1,
            limit = 10
        } = req.query;
        
        const query = { pandit: pandit._id };
        
        if (status) {
            query.status = status;
        }
        
        if (upcoming === 'true') {
            query.date = { $gte: new Date() };
            query.status = { $in: ['pending', 'confirmed'] };
        }
        
        if (past === 'true') {
            query.$or = [
                { date: { $lt: new Date() } },
                { status: { $in: ['completed', 'cancelled'] } }
            ];
        }
        
        const total = await Booking.countDocuments(query);
        
        const bookings = await Booking.find(query)
            .populate('customer', 'fullName phone profilePhoto')
            .populate('service', 'name icon')
            .select('bookingNumber date startTime duration venue pricing status paymentStatus customer')
            .sort({ date: upcoming === 'true' ? 1 : -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            ...paginationResponse(bookings, parseInt(page), parseInt(limit), total)
        });
        
    } catch (error) {
        next(error);
    }
};