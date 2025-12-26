/**
 * ===========================================
 * CATEGORY CONTROLLER
 * ===========================================
 */

const Category = require('../models/Category');
const Service = require('../models/Service');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
    try {
        const { 
            parent, 
            active = 'true',
            featured,
            limit = 20 
        } = req.query;
        
        // Build query
        const query = {};
        
        if (parent === 'null' || parent === 'root') {
            query.parent = null;
        } else if (parent) {
            query.parent = parent;
        }
        
        if (active === 'true') {
            query.isActive = true;
        }
        
        if (featured === 'true') {
            query.isFeatured = true;
        }
        
        const categories = await Category.find(query)
            .populate('subcategories', 'name slug icon')
            .sort({ displayOrder: 1, name: 1 })
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ 
            slug: req.params.slug,
            isActive: true 
        })
        .populate('subcategories', 'name slug icon description serviceCount')
        .populate('parent', 'name slug');
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Get services in this category
        const services = await Service.find({ 
            category: category._id,
            isActive: true 
        })
        .select('name slug icon image price duration isPopular isFeatured')
        .sort({ displayOrder: 1 })
        .limit(20);
        
        res.status(200).json({
            success: true,
            data: {
                category,
                services
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create category (Admin)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        
        res.status(201).json({
            success: true,
            data: category
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update category (Admin)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: category
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete category (Admin)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if category has services
        const serviceCount = await Service.countDocuments({ category: category._id });
        if (serviceCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${serviceCount} services. Move or delete services first.`
            });
        }
        
        // Check if category has subcategories
        const subcategoryCount = await Category.countDocuments({ parent: category._id });
        if (subcategoryCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${subcategoryCount} subcategories. Delete subcategories first.`
            });
        }
        
        await category.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
        
    } catch (error) {
        next(error);
    }
};