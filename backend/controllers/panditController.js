/**
 * ===========================================
 * PANDIT CONTROLLER
 * ===========================================
 */

const Pandit = require('../models/Pandit');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');
const { paginationResponse, buildSortObject, calculateDistance } = require('../utils/helpers');
const { PANDIT_STATUS } = require('../config/constants');

/**
 * @desc    Get all pandits (public listing)
 * @route   GET /api/pandits
 * @access  Public
 */
exports.getPandits = async (req, res, next) => {
    try {
        const {
            city,
            service,
            language,
            minExperience,
            minRating,
            featured,
            verified,
            available,
            lat,
            lng,
            radius = 25,
            search,
            page = 1,
            limit = 12,
            sort = '-stats.averageRating'
        } = req.query;
        
        // Build query
        const query = {
            status: PANDIT_STATUS.ACTIVE,
            isAvailable: true
        };
        
        // City filter
        if (city) {
            query.$or = [
                { baseCity: city },
                { serviceableAreas: city }
            ];
        }
        
        // Service filter
        if (service) {
            const serviceDoc = await Service.findOne({ slug: service });
            if (serviceDoc) {
                query['services.service'] = serviceDoc._id;
                query['services.isActive'] = true;
            }
        }
        
        // Language filter
        if (language) {
            query.languages = language;
        }
        
        // Experience filter
        if (minExperience) {
            query.yearsOfExperience = { $gte: parseInt(minExperience) };
        }
        
        // Rating filter
        if (minRating) {
            query['stats.averageRating'] = { $gte: parseFloat(minRating) };
        }
        
        // Featured filter
        if (featured === 'true') {
            query.isFeatured = true;
        }
        
        // Verified filter
        if (verified === 'true') {
            query.verificationLevel = { $in: ['verified', 'premium', 'elite'] };
        }
        
        // Available filter
        if (available === 'false') {
            delete query.isAvailable;
        }
        
        // Location-based search
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius) * 1000 // Convert km to meters
                }
            };
        }
        
        // Text search
        if (search) {
            query.$text = { $search: search };
        }
        
        // Execute query
        const total = await Pandit.countDocuments(query);
        
        // Use a deterministic tie-breaker so results don't appear to "shuffle" between requests
        const sortObj = buildSortObject(sort);
        if (!Object.prototype.hasOwnProperty.call(sortObj, '_id')) {
            sortObj._id = 1;
        }

        const pandits = await Pandit.find(query)
            .populate('user', 'fullName profilePhoto phone')
            .select('displayName tagline user yearsOfExperience languages specializations baseCity stats verificationLevel isFeatured profileCompleteness')
            .sort(sortObj)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        // Format response
        const formattedPandits = pandits.map(pandit => ({
            id: pandit._id,
            displayName: pandit.displayName,
            tagline: pandit.tagline,
            profilePhoto: pandit.user?.profilePhoto,
            yearsOfExperience: pandit.yearsOfExperience,
            languages: pandit.languages,
            specializations: pandit.specializations,
            baseCity: pandit.baseCity,
            rating: pandit.stats?.averageRating || 0,
            reviewCount: pandit.stats?.totalReviews || 0,
            completedBookings: pandit.stats?.completedBookings || 0,
            verificationLevel: pandit.verificationLevel,
            isFeatured: pandit.isFeatured
        }));
        
        res.status(200).json({
            success: true,
            ...paginationResponse(formattedPandits, parseInt(page), parseInt(limit), total)
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get featured pandits
 * @route   GET /api/pandits/featured
 * @access  Public
 */
exports.getFeaturedPandits = async (req, res, next) => {
    try {
        const { city, limit = 8 } = req.query;
        
        const query = {
            status: PANDIT_STATUS.ACTIVE,
            isAvailable: true,
            isFeatured: true
        };
        
        if (city) {
            query.$or = [
                { baseCity: city },
                { serviceableAreas: city }
            ];
        }
        
        // Deterministic sorting: rating desc, then reviews desc, then experience desc, then _id asc
        const pandits = await Pandit.find(query)
            .populate('user', 'fullName profilePhoto')
            .select('displayName tagline user yearsOfExperience languages baseCity stats verificationLevel')
            .sort({
                'stats.averageRating': -1,
                'stats.totalReviews': -1,
                yearsOfExperience: -1,
                _id: 1
            })
            .limit(parseInt(limit));
        
        const formattedPandits = pandits.map(pandit => ({
            id: pandit._id,
            displayName: pandit.displayName,
            tagline: pandit.tagline,
            profilePhoto: pandit.user?.profilePhoto,
            yearsOfExperience: pandit.yearsOfExperience,
            languages: pandit.languages,
            baseCity: pandit.baseCity,
            rating: pandit.stats?.averageRating || 0,
            reviewCount: pandit.stats?.totalReviews || 0,
            verificationLevel: pandit.verificationLevel
        }));
        
        res.status(200).json({
            success: true,
            count: formattedPandits.length,
            data: formattedPandits
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single pandit profile
 * @route   GET /api/pandits/:id
 * @access  Public
 */
exports.getPandit = async (req, res, next) => {
    try {
        const pandit = await Pandit.findById(req.params.id)
            .populate('user', 'fullName profilePhoto createdAt')
            .populate('services.service', 'name slug category price duration');
        
        if (!pandit || pandit.status !== PANDIT_STATUS.ACTIVE) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }
        
        // Get reviews
        const reviews = await Review.find({
            pandit: pandit._id,
            isVisible: true
        })
        .populate('customer', 'fullName profilePhoto')
        .populate('service', 'name')
        .select('overallRating reviewText customer service createdAt panditResponse')
        .sort({ createdAt: -1 })
        .limit(10);
        
        // Format services with pricing
        const services = pandit.services
            .filter(s => s.isActive)
            .map(s => ({
                id: s.service?._id,
                name: s.service?.name,
                slug: s.service?.slug,
                price: s.price,
                duration: s.duration,
                inclusions: s.inclusions,
                onlineAvailable: s.onlineAvailable,
                onlinePrice: s.onlinePrice
            }));
        
        res.status(200).json({
            success: true,
            data: {
                pandit: {
                    id: pandit._id,
                    displayName: pandit.displayName,
                    tagline: pandit.tagline,
                    bio: pandit.bio,
                    profilePhoto: pandit.user?.profilePhoto,
                    profileVideo: pandit.profileVideo,
                    yearsOfExperience: pandit.yearsOfExperience,
                    education: pandit.education,
                    certifications: pandit.certifications,
                    guruName: pandit.guruName,
                    guruLineage: pandit.guruLineage,
                    templeAffiliations: pandit.templeAffiliations,
                    languages: pandit.languages,
                    specializations: pandit.specializations,
                    baseCity: pandit.baseCity,
                    serviceableAreas: pandit.serviceableAreas,
                    travelRadiusKm: pandit.travelRadiusKm,
                    verificationLevel: pandit.verificationLevel,
                    stats: pandit.stats,
                    gallery: pandit.gallery,
                    isAvailable: pandit.isAvailable,
                    memberSince: pandit.user?.createdAt
                },
                services,
                reviews: reviews.map(r => ({
                    id: r._id,
                    rating: r.overallRating,
                    text: r.reviewText,
                    customerName: r.customer?.fullName,
                    customerPhoto: r.customer?.profilePhoto,
                    serviceName: r.service?.name,
                    date: r.createdAt,
                    panditResponse: r.panditResponse
                })),
                availability: {
                    schedule: pandit.availability?.schedule,
                    minimumNoticeHours: pandit.availability?.minimumNoticeHours,
                    maxAdvanceBookingDays: pandit.availability?.maxAdvanceBookingDays
                }
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get pandit's own profile (for pandit dashboard)
 * @route   GET /api/pandits/me
 * @access  Private/Pandit
 */
exports.getMyProfile = async (req, res, next) => {
    try {
        const pandit = await Pandit.findOne({ user: req.user._id })
            .populate('user', 'fullName email phone profilePhoto')
            .populate('services.service', 'name slug category');
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: pandit
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update pandit profile
 * @route   PUT /api/pandits/me
 * @access  Private/Pandit
 */
exports.updateMyProfile = async (req, res, next) => {
    try {
        // Fields that can be updated
        const allowedFields = [
            'displayName', 'tagline', 'bio', 'profileVideo',
            'yearsOfExperience', 'education', 'certifications',
            'guruName', 'guruLineage', 'templeAffiliations',
            'languages', 'specializations', 'baseCity', 'serviceableAreas',
            'travelRadiusKm', 'travelCharge', 'availability', 'isAvailable'
        ];
        
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        
        const pandit = await Pandit.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: pandit
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add/Update service offering
 * @route   POST /api/pandits/me/services
 * @access  Private/Pandit
 */
exports.addService = async (req, res, next) => {
    try {
        const { serviceId, price, duration, inclusions, addOns, onlineAvailable, onlinePrice } = req.body;
        
        if (!serviceId || !price) {
            return res.status(400).json({
                success: false,
                message: 'Service ID and price are required'
            });
        }
        
        // Check if service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        const pandit = await Pandit.findOne({ user: req.user._id });
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        // Check if already offering this service
        const existingIndex = pandit.services.findIndex(
            s => s.service.toString() === serviceId
        );
        
        const serviceData = {
            service: serviceId,
            isActive: true,
            price,
            duration: duration || service.duration.min,
            inclusions: inclusions || [],
            addOns: addOns || [],
            onlineAvailable: onlineAvailable || false,
            onlinePrice: onlinePrice || price
        };
        
        if (existingIndex > -1) {
            // Update existing
            pandit.services[existingIndex] = serviceData;
        } else {
            // Add new
            pandit.services.push(serviceData);
        }
        
        await pandit.save();
        
        res.status(200).json({
            success: true,
            message: existingIndex > -1 ? 'Service updated' : 'Service added',
            data: pandit.services
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove service offering
 * @route   DELETE /api/pandits/me/services/:serviceId
 * @access  Private/Pandit
 */
exports.removeService = async (req, res, next) => {
    try {
        const pandit = await Pandit.findOne({ user: req.user._id });
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        pandit.services = pandit.services.filter(
            s => s.service.toString() !== req.params.serviceId
        );
        
        await pandit.save();
        
        res.status(200).json({
            success: true,
            message: 'Service removed',
            data: pandit.services
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update bank details
 * @route   PUT /api/pandits/me/bank-details
 * @access  Private/Pandit
 */
exports.updateBankDetails = async (req, res, next) => {
    try {
        const { accountNumber, ifsc, accountHolderName, bankName, upiId } = req.body;
        
        const pandit = await Pandit.findOneAndUpdate(
            { user: req.user._id },
            {
                bankDetails: {
                    accountNumber,
                    ifsc,
                    accountHolderName,
                    bankName,
                    upiId
                }
            },
            { new: true }
        );
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Bank details updated successfully'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get pandit dashboard stats
 * @route   GET /api/pandits/me/stats
 * @access  Private/Pandit
 */
exports.getMyStats = async (req, res, next) => {
    try {
        const pandit = await Pandit.findOne({ user: req.user._id });
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit profile not found'
            });
        }
        
        // Update stats before returning
        await pandit.updateStats();
        
        res.status(200).json({
            success: true,
            data: {
                stats: pandit.stats,
                commissionTier: pandit.commissionTier,
                commissionRate: pandit.commissionRate,
                verificationLevel: pandit.verificationLevel,
                profileCompleteness: pandit.profileCompleteness
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify pandit (Admin)
 * @route   PUT /api/pandits/:id/verify
 * @access  Private/Admin
 */
exports.verifyPandit = async (req, res, next) => {
    try {
        const { verificationLevel, status } = req.body;
        
        const pandit = await Pandit.findByIdAndUpdate(
            req.params.id,
            {
                verificationLevel: verificationLevel || 'verified',
                status: status || PANDIT_STATUS.ACTIVE,
                approvedAt: new Date(),
                approvedBy: req.user._id
            },
            { new: true }
        );
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }
        
        // Update user role
        await User.findByIdAndUpdate(pandit.user, { role: 'pandit' });
        
        res.status(200).json({
            success: true,
            message: 'Pandit verified successfully',
            data: pandit
        });
        
    } catch (error) {
        next(error);
    }
};