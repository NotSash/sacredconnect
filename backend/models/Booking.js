/**
 * ===========================================
 * BOOKING MODEL
 * ===========================================
 */

const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS, BOOKING } = require('../config/constants');

const bookingSchema = new mongoose.Schema({
    bookingNumber: {
        type: String,
        unique: true,
        required: true
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
    // Status
    status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.PENDING
    },
    // Schedule
    date: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required']
    },
    endTime: String,
    duration: {
        type: Number, // in hours
        required: true
    },
    // Venue
    venueType: {
        type: String,
        enum: ['customer_home', 'pandit_location', 'temple', 'office', 'other', 'online'],
        default: 'customer_home'
    },
    venue: {
        address: {
            fullAddress: String,
            flatNumber: String,
            buildingName: String,
            street: String,
            locality: String,
            city: String,
            state: String,
            pincode: String,
            landmark: String
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    },
    specialInstructions: String,
    // Ceremony details
    sankalpDetails: {
        primaryPerson: {
            name: String,
            gotra: String,
            nakshatra: String
        },
        additionalPersons: [{
            name: String,
            relation: String,
            gotra: String,
            nakshatra: String
        }]
    },
    pujaFor: {
        name: String,
        relation: String,
        occasion: String
    },
    // Add-ons
    addOns: [{
        name: String,
        price: Number
    }],
    // Samagri
    samagriOption: {
        type: String,
        enum: ['self_arranged', 'basic_kit', 'complete_kit', 'premium_kit', 'pandit_provides'],
        default: 'self_arranged'
    },
    samagriKitDetails: {
        kitType: String,
        items: [String],
        deliveryDate: Date,
        deliveryStatus: {
            type: String,
            enum: ['pending', 'shipped', 'delivered'],
            default: 'pending'
        },
        trackingNumber: String
    },
    // Pricing
    pricing: {
        basePrice: { type: Number, required: true },
        addOnsTotal: { type: Number, default: 0 },
        samagriPrice: { type: Number, default: 0 },
        travelCharge: { type: Number, default: 0 },
        convenienceFee: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        promoCode: String,
        taxAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        advanceAmount: { type: Number, default: 0 },
        balanceAmount: { type: Number, default: 0 }
    },
    // Payment
    paymentStatus: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING
    },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    // Pandit payout
    panditPayout: {
        amount: Number,
        commission: Number,
        status: {
            type: String,
            enum: ['pending', 'processed', 'paid'],
            default: 'pending'
        },
        paidAt: Date,
        transactionId: String
    },
    // Timestamps
    confirmedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
        type: String,
        enum: ['customer', 'pandit', 'admin']
    },
    cancellationReason: String,
    refund: {
        amount: Number,
        status: {
            type: String,
            enum: ['not_applicable', 'pending', 'processed', 'failed'],
            default: 'not_applicable'
        },
        processedAt: Date,
        transactionId: String
    },
    // Review
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    customerRating: {
        type: Number,
        min: 1,
        max: 5
    },
    // Video call (for online pujas)
    videoCall: {
        link: String,
        platform: {
            type: String,
            enum: ['zoom', 'google_meet', 'whatsapp']
        },
        recordingUrl: String
    },
    // Meta
    source: {
        type: String,
        enum: ['app', 'web', 'admin', 'api'],
        default: 'web'
    },
    utm: {
        source: String,
        medium: String,
        campaign: String
    },
    notes: {
        customer: String,
        pandit: String,
        admin: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ pandit: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Generate booking number
bookingSchema.statics.generateBookingNumber = async function() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of bookings this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const count = await this.countDocuments({
        createdAt: { $gte: startOfMonth }
    });
    
    const number = (count + 1).toString().padStart(5, '0');
    return `SC${year}${month}${number}`;
};

// Calculate pricing
bookingSchema.methods.calculatePricing = function() {
    const addOnsTotal = this.addOns.reduce((sum, addon) => sum + (addon.price || 0), 0);
    
    const subtotal = this.pricing.basePrice + addOnsTotal + 
                     this.pricing.samagriPrice + this.pricing.travelCharge;
    
    // Convenience fee (2% or minimum ₹20)
    const convenienceFee = Math.max(Math.round(subtotal * 0.02), 20);
    
    // Tax (if applicable)
    const taxAmount = 0; // Can add GST logic here
    
    const totalAmount = subtotal + convenienceFee + taxAmount - this.pricing.discount;
    
    // Advance (20%)
    const advanceAmount = Math.round(totalAmount * (BOOKING.ADVANCE_PERCENTAGE / 100));
    const balanceAmount = totalAmount - advanceAmount;
    
    this.pricing.addOnsTotal = addOnsTotal;
    this.pricing.convenienceFee = convenienceFee;
    this.pricing.taxAmount = taxAmount;
    this.pricing.totalAmount = totalAmount;
    this.pricing.advanceAmount = advanceAmount;
    this.pricing.balanceAmount = balanceAmount;
    
    return this.pricing;
};

// Calculate pandit payout
bookingSchema.methods.calculatePanditPayout = async function() {
    const Pandit = mongoose.model('Pandit');
    const pandit = await Pandit.findById(this.pandit);
    
    if (!pandit) return;
    
    const commissionRate = pandit.commissionRate || 25;
    const serviceAmount = this.pricing.basePrice + this.pricing.addOnsTotal;
    const commission = Math.round(serviceAmount * (commissionRate / 100));
    const payout = serviceAmount - commission;
    
    this.panditPayout = {
        amount: payout,
        commission: commission,
        status: 'pending'
    };
    
    return this.panditPayout;
};

// Pre-save hook
bookingSchema.pre('save', async function(next) {
    // Generate booking number if new
    if (this.isNew && !this.bookingNumber) {
        this.bookingNumber = await this.constructor.generateBookingNumber();
    }
    
    // Calculate pricing
    if (this.isModified('pricing') || this.isModified('addOns')) {
        this.calculatePricing();
    }
    
    next();
});

// Post-save hook to update pandit stats
bookingSchema.post('save', async function() {
    if (this.isModified('status')) {
        const Pandit = mongoose.model('Pandit');
        const pandit = await Pandit.findById(this.pandit);
        if (pandit) {
            await pandit.updateStats();
        }
    }
});

module.exports = mongoose.model('Booking', bookingSchema);