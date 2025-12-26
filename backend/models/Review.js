/**
 * ===========================================
 * REVIEW MODEL
 * ===========================================
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pandit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pandit',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    // Ratings (1-5)
    overallRating: {
        type: Number,
        required: [true, 'Overall rating is required'],
        min: 1,
        max: 5
    },
    punctualityRating: {
        type: Number,
        min: 1,
        max: 5
    },
    knowledgeRating: {
        type: Number,
        min: 1,
        max: 5
    },
    behaviorRating: {
        type: Number,
        min: 1,
        max: 5
    },
    valueRating: {
        type: Number,
        min: 1,
        max: 5
    },
    // Review text
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    reviewText: {
        type: String,
        trim: true,
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    // Photos
    photos: [{
        url: String,
        caption: String
    }],
    // Verification
    isVerifiedBooking: {
        type: Boolean,
        default: true
    },
    // Pandit response
    panditResponse: {
        text: String,
        respondedAt: Date
    },
    // Visibility
    isVisible: {
        type: Boolean,
        default: true
    },
    // Flagging
    isFlagged: {
        type: Boolean,
        default: false
    },
    flagReason: String,
    flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    flaggedAt: Date,
    // Admin review
    adminReviewed: {
        type: Boolean,
        default: false
    },
    adminNotes: String,
    // Helpful votes
    helpfulVotes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        votedAt: Date
    }],
    helpfulCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ booking: 1 });
reviewSchema.index({ pandit: 1, isVisible: 1 });
reviewSchema.index({ service: 1, isVisible: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ overallRating: -1 });
reviewSchema.index({ createdAt: -1 });

// Calculate average rating
reviewSchema.methods.getAverageRating = function() {
    const ratings = [
        this.punctualityRating,
        this.knowledgeRating,
        this.behaviorRating,
        this.valueRating
    ].filter(r => r != null);
    
    if (ratings.length === 0) return this.overallRating;
    
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
};

// Post-save hook to update pandit and service stats
reviewSchema.post('save', async function() {
    const Pandit = mongoose.model('Pandit');
    const Service = mongoose.model('Service');
    
    // Update pandit stats
    const pandit = await Pandit.findById(this.pandit);
    if (pandit) {
        await pandit.updateStats();
    }
    
    // Update service stats
    await Service.updateStats(this.service);
});

// Post-remove hook
reviewSchema.post('remove', async function() {
    const Pandit = mongoose.model('Pandit');
    const Service = mongoose.model('Service');
    
    const pandit = await Pandit.findById(this.pandit);
    if (pandit) {
        await pandit.updateStats();
    }
    
    await Service.updateStats(this.service);
});

module.exports = mongoose.model('Review', reviewSchema);