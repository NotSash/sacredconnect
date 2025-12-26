/**
 * ===========================================
 * PANDIT MODEL
 * ===========================================
 */

const mongoose = require('mongoose');
const { VERIFICATION_LEVELS, PANDIT_STATUS, COMMISSION_TIERS } = require('../config/constants');

const panditSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    tagline: {
        type: String,
        trim: true,
        maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    profileVideo: {
        type: String // Cloudinary URL
    },
    yearsOfExperience: {
        type: Number,
        min: 0,
        max: 70
    },
    education: [{
        degree: String,
        institution: String,
        year: Number,
        document: String // Cloudinary URL
    }],
    certifications: [{
        name: String,
        issuer: String,
        year: Number,
        document: String // Cloudinary URL
    }],
    guruName: {
        type: String,
        trim: true
    },
    guruLineage: {
        type: String,
        trim: true
    },
    templeAffiliations: [{
        name: String,
        location: String,
        role: String
    }],
    languages: [{
        type: String,
        required: true
    }],
    specializations: [{
        type: String
    }],
    // Verification
    documents: {
        aadhar: {
            number: String, // Encrypted
            document: String,
            verified: { type: Boolean, default: false }
        },
        pan: {
            number: String, // Encrypted
            document: String,
            verified: { type: Boolean, default: false }
        }
    },
    backgroundCheck: {
        status: {
            type: String,
            enum: ['not_started', 'pending', 'passed', 'failed'],
            default: 'not_started'
        },
        date: Date,
        notes: String
    },
    verificationLevel: {
        type: String,
        enum: Object.values(VERIFICATION_LEVELS),
        default: VERIFICATION_LEVELS.BASIC
    },
    // Services offered
    services: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        },
        isActive: { type: Boolean, default: true },
        customDescription: String,
        price: { type: Number, required: true },
        duration: Number, // in hours
        inclusions: [String],
        addOns: [{
            name: String,
            price: Number,
            description: String
        }],
        samagriOption: {
            type: String,
            enum: ['customer_arranges', 'pandit_provides', 'platform_kit'],
            default: 'customer_arranges'
        },
        samagriPrice: Number,
        onlineAvailable: { type: Boolean, default: false },
        onlinePrice: Number
    }],
    // Availability
    availability: {
        schedule: [{
            dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
            startTime: String, // "09:00"
            endTime: String, // "18:00"
            isAvailable: { type: Boolean, default: true }
        }],
        blockedDates: [{
            date: Date,
            reason: String
        }],
        minimumNoticeHours: { type: Number, default: 24 },
        maxAdvanceBookingDays: { type: Number, default: 90 }
    },
    // Location & Travel
    baseCity: {
        type: String,
        required: [true, 'Base city is required']
    },
    serviceableAreas: [{
        type: String
    }],
    travelRadiusKm: {
        type: Number,
        default: 25
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    travelCharge: {
        freeUpToKm: { type: Number, default: 10 },
        chargePerKm: { type: Number, default: 20 }
    },
    // Banking
    bankDetails: {
        accountNumber: String, // Encrypted
        ifsc: String,
        accountHolderName: String,
        bankName: String,
        upiId: String
    },
    payoutFrequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'weekly'
    },
    // Commission
    commissionTier: {
        type: String,
        enum: Object.keys(COMMISSION_TIERS).map(k => k.toLowerCase()),
        default: 'new'
    },
    commissionRate: {
        type: Number,
        default: COMMISSION_TIERS.NEW.rate
    },
    // Stats
    stats: {
        totalBookings: { type: Number, default: 0 },
        completedBookings: { type: Number, default: 0 },
        cancelledBookings: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        responseRate: { type: Number, default: 100 },
        acceptanceRate: { type: Number, default: 100 },
        completionRate: { type: Number, default: 100 },
        repeatCustomerRate: { type: Number, default: 0 }
    },
    // Profile
    profileCompleteness: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    gallery: [{
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    // Status
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: Object.values(PANDIT_STATUS),
        default: PANDIT_STATUS.PENDING
    },
    // Admin
    approvedAt: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    suspendedAt: Date,
    suspensionReason: String,
    notes: String // Admin notes
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
panditSchema.index({ user: 1 });
panditSchema.index({ baseCity: 1 });
panditSchema.index({ status: 1, isAvailable: 1 });
panditSchema.index({ 'stats.averageRating': -1 });
panditSchema.index({ isFeatured: 1 });
panditSchema.index({ location: '2dsphere' });
panditSchema.index({ languages: 1 });
panditSchema.index({ 'services.service': 1 });
panditSchema.index({ displayName: 'text', bio: 'text', specializations: 'text' });

// Virtual for reviews
panditSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'pandit'
});

// Virtual for bookings
panditSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'pandit'
});

// Calculate profile completeness
panditSchema.methods.calculateProfileCompleteness = function() {
    let score = 0;
    const fields = [
        { field: this.displayName, weight: 10 },
        { field: this.bio, weight: 10 },
        { field: this.profileVideo, weight: 5 },
        { field: this.yearsOfExperience, weight: 5 },
        { field: this.education?.length > 0, weight: 10 },
        { field: this.languages?.length > 0, weight: 10 },
        { field: this.services?.length > 0, weight: 15 },
        { field: this.documents?.aadhar?.verified, weight: 10 },
        { field: this.documents?.pan?.verified, weight: 5 },
        { field: this.gallery?.length > 0, weight: 5 },
        { field: this.availability?.schedule?.length > 0, weight: 10 },
        { field: this.bankDetails?.accountNumber, weight: 5 }
    ];
    
    fields.forEach(f => {
        if (f.field) score += f.weight;
    });
    
    return score;
};

// Update stats
panditSchema.methods.updateStats = async function() {
    const Booking = mongoose.model('Booking');
    const Review = mongoose.model('Review');
    
    // Booking stats
    const bookingStats = await Booking.aggregate([
        { $match: { pandit: this._id } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                earnings: { $sum: '$panditPayout' }
            }
        }
    ]);
    
    // Review stats
    const reviewStats = await Review.aggregate([
        { $match: { pandit: this._id, isVisible: true } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$overallRating' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Calculate stats
    let totalBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;
    let totalEarnings = 0;
    
    bookingStats.forEach(stat => {
        totalBookings += stat.count;
        if (stat._id === 'completed') {
            completedBookings = stat.count;
            totalEarnings = stat.earnings || 0;
        }
        if (stat._id === 'cancelled') {
            cancelledBookings = stat.count;
        }
    });
    
    this.stats = {
        ...this.stats,
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings,
        averageRating: reviewStats[0]?.avgRating || 0,
        totalReviews: reviewStats[0]?.count || 0,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 100
    };
    
    // Update commission tier based on completed bookings
    if (completedBookings >= 500) {
        this.commissionTier = 'elite';
        this.commissionRate = COMMISSION_TIERS.ELITE.rate;
    } else if (completedBookings >= 200) {
        this.commissionTier = 'premium';
        this.commissionRate = COMMISSION_TIERS.PREMIUM.rate;
    } else if (completedBookings >= 50) {
        this.commissionTier = 'established';
        this.commissionRate = COMMISSION_TIERS.ESTABLISHED.rate;
    }
    
    await this.save();
};

// Pre-save hook to update profile completeness
panditSchema.pre('save', function(next) {
    this.profileCompleteness = this.calculateProfileCompleteness();
    next();
});

module.exports = mongoose.model('Pandit', panditSchema);