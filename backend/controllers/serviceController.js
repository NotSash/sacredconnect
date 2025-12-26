/**
 * ===========================================
 * SERVICE CONTROLLER
 * ===========================================
 */

const Service = require('../models/Service');
const Category = require('../models/Category');
const Pandit = require('../models/Pandit');
const { paginationResponse, buildSortObject } = require('../utils/helpers');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res, next) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            featured,
            popular,
            city,
            mode,
            page = 1,
            limit = 12,
            sort = '-createdAt'
        } = req.query;
        
        // Build query
        const query = { isActive: true };
        
        // Category filter
        if (category) {
            const cat = await Category.findOne({ slug: category });
            if (cat) {
                query.category = cat._id;
            }
        }
        
        // Search
        if (search) {
            query.$text = { $search: search };
        }
        
        // Price filter
        if (minPrice || maxPrice) {
            query['price.min'] = {};
            if (minPrice) query['price.min'].$gte = parseInt(minPrice);
            if (maxPrice) query['price.max'] = { $lte: parseInt(maxPrice) };
        }
        
        // Featured/Popular
        if (featured === 'true') query.isFeatured = true;
        if (popular === 'true') query.isPopular = true;
        
        // City filter
        if (city) {
            query.$or = [
                { availableCities: { $size: 0 } }, // Available everywhere
                { availableCities: city }
            ];
        }
        
        // Service mode filter
        if (mode) {
            query.availableModes = mode;
        }
        
        // Execute query
        const total = await Service.countDocuments(query);
        
        const services = await Service.find(query)
            .populate('category', 'name slug')
            .select('name slug icon image description price duration isPopular isFeatured averageRating reviewCount bookingCount')
            .sort(buildSortObject(sort))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            ...paginationResponse(services, parseInt(page), parseInt(limit), total)
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get featured services
 * @route   GET /api/services/featured
 * @access  Public
 */
exports.getFeaturedServices = async (req, res, next) => {
    try {
        const { limit = 8 } = req.query;
        
        const services = await Service.find({ 
            isActive: true,
            isFeatured: true 
        })
        .populate('category', 'name slug')
        .select('name slug icon image description price duration averageRating')
        .sort({ displayOrder: 1 })
        .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get popular services
 * @route   GET /api/services/popular
 * @access  Public
 */
exports.getPopularServices = async (req, res, next) => {
    try {
        const { limit = 8 } = req.query;
        
        const services = await Service.find({ 
            isActive: true,
            isPopular: true 
        })
        .populate('category', 'name slug')
        .select('name slug icon image description price duration averageRating bookingCount')
        .sort({ bookingCount: -1 })
        .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single service by slug
 * @route   GET /api/services/:slug
 * @access  Public
 */
exports.getService = async (req, res, next) => {
    try {
        const service = await Service.findOne({ 
            slug: req.params.slug,
            isActive: true 
        })
        .populate('category', 'name slug');
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        // Get pandits offering this service
        const pandits = await Pandit.find({
            'services.service': service._id,
            'services.isActive': true,
            status: 'active',
            isAvailable: true
        })
        .populate('user', 'fullName profilePhoto')
        .select('displayName user yearsOfExperience languages stats.averageRating stats.totalReviews baseCity services')
        // Deterministic sorting: rating desc, then reviews desc, then experience desc, then _id asc
        .sort({
            'stats.averageRating': -1,
            'stats.totalReviews': -1,
            yearsOfExperience: -1,
            _id: 1
        })
        .limit(10);
        
        // Extract relevant service info from each pandit
        const panditsWithPricing = pandits.map(pandit => {
            const panditService = pandit.services.find(
                s => s.service.toString() === service._id.toString()
            );
            return {
                id: pandit._id,
                displayName: pandit.displayName,
                profilePhoto: pandit.user?.profilePhoto,
                yearsOfExperience: pandit.yearsOfExperience,
                languages: pandit.languages,
                rating: pandit.stats?.averageRating || 0,
                reviewCount: pandit.stats?.totalReviews || 0,
                baseCity: pandit.baseCity,
                price: panditService?.price || service.price.min,
                duration: panditService?.duration || service.duration.min
            };
        });
        
        // Get related services
        const relatedServices = await Service.find({
            category: service.category._id,
            _id: { $ne: service._id },
            isActive: true
        })
        .select('name slug icon image price')
        .limit(4);
        
        res.status(200).json({
            success: true,
            data: {
                service,
                pandits: panditsWithPricing,
                relatedServices
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create service (Admin)
 * @route   POST /api/services
 * @access  Private/Admin
 */
exports.createService = async (req, res, next) => {
    try {
        const service = await Service.create(req.body);
        
        // Update category service count
        await Category.updateServiceCount(service.category);
        
        res.status(201).json({
            success: true,
            data: service
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update service (Admin)
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
exports.updateService = async (req, res, next) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        // Update category service count
        await Category.updateServiceCount(service.category);
        
        res.status(200).json({
            success: true,
            data: service
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete service (Admin)
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
exports.deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        const categoryId = service.category;
        await service.deleteOne();
        
        // Update category service count
        await Category.updateServiceCount(categoryId);
        
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search services
 * @route   GET /api/services/search
 * @access  Public
 */
exports.searchServices = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }
        
        const services = await Service.find({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ]
        })
        .populate('category', 'name slug')
        .select('name slug icon category price')
        .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
        
    } catch (error) {
        next(error);
    }
};