/**
 * ===========================================
 * CATEGORY MODEL
 * ===========================================
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    significance: {
        type: String,
        trim: true
    },
    icon: {
        type: String, // Emoji or icon class
        default: '🙏'
    },
    image: {
        type: String // Cloudinary URL
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    serviceCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ displayOrder: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual for services
categorySchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'category'
});

// Generate slug before saving
// If slug is provided explicitly (e.g., from a catalog import), preserve it.
categorySchema.pre('save', function(next) {
    if (this.isModified('slug') && this.slug) {
        this.slug = slugify(this.slug, { lower: true, strict: true });
    }

    if (!this.slug && this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }

    next();
});

// Update service count
categorySchema.statics.updateServiceCount = async function(categoryId) {
    const Service = mongoose.model('Service');
    const count = await Service.countDocuments({ 
        category: categoryId, 
        isActive: true 
    });
    await this.findByIdAndUpdate(categoryId, { serviceCount: count });
};

module.exports = mongoose.model('Category', categorySchema);