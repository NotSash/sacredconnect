/**
 * ===========================================
 * SERVICE MODEL (Puja/Ceremony Types)
 * ===========================================
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [150, 'Name cannot exceed 150 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    detailedDescription: {
        type: String,
        trim: true
    },
    significance: {
        type: String,
        trim: true
    },
    procedure: {
        type: String,
        trim: true
    },
    duration: {
        min: { type: Number, default: 1 }, // in hours
        max: { type: Number, default: 2 }
    },
    // Pricing can be set later via admin panel / pandit-specific pricing
    // Keep optional for MVP so catalog can be imported without hardcoding prices.
    price: {
        min: { type: Number, default: null },
        max: { type: Number, default: null }
    },
    inclusions: [{
        type: String,
        trim: true
    }],
    requiredItems: [{
        type: String,
        trim: true
    }],
    optionalAddOns: [{
        name: String,
        description: String,
        price: Number
    }],
    bestMuhurat: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    gallery: [{
        type: String
    }],
    icon: {
        type: String,
        default: '🙏'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    // Stats
    bookingCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    // Service availability
    availableModes: [{
        type: String,
        enum: ['at_customer', 'at_pandit', 'online', 'temple']
    }],
    availableCities: [{
        type: String
    }],
    // Samagri kits
    samagriKits: [{
        type: {
            type: String,
            enum: ['basic', 'complete', 'premium']
        },
        name: String,
        description: String,
        items: [String],
        customerArranges: [String],
        price: Number,
        image: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
serviceSchema.index({ slug: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1, isFeatured: 1 });
serviceSchema.index({ isActive: 1, isPopular: 1 });
serviceSchema.index({ 'price.min': 1, 'price.max': 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for pandits offering this service
serviceSchema.virtual('pandits', {
    ref: 'Pandit',
    localField: '_id',
    foreignField: 'services.service'
});

// Generate slug before saving
// If slug is provided explicitly (e.g., from a catalog import), preserve it.
serviceSchema.pre('save', function(next) {
    if (this.isModified('slug') && this.slug) {
        this.slug = slugify(this.slug, { lower: true, strict: true });
    }

    if (!this.slug && this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }

    next();
});

// Update category service count after save
serviceSchema.post('save', async function() {
    const Category = mongoose.model('Category');
    await Category.updateServiceCount(this.category);
});

// Static method to update stats
serviceSchema.statics.updateStats = async function(serviceId) {
    const Review = mongoose.model('Review');
    const Booking = mongoose.model('Booking');
    
    // Get review stats
    const reviewStats = await Review.aggregate([
        { $match: { service: new mongoose.Types.ObjectId(serviceId), isVisible: true } },
        { 
            $group: {
                _id: null,
                averageRating: { $avg: '$overallRating' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Get booking count
    const bookingCount = await Booking.countDocuments({
        service: serviceId,
        status: { $in: ['completed'] }
    });
    
    // Update service
    await this.findByIdAndUpdate(serviceId, {
        averageRating: reviewStats[0]?.averageRating || 0,
        reviewCount: reviewStats[0]?.count || 0,
        bookingCount
    });
};

module.exports = mongoose.model('Service', serviceSchema);