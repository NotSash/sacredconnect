/**
 * ===========================================
 * PAYMENT MODEL
 * ===========================================
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Payment type
    type: {
        type: String,
        enum: ['booking_advance', 'booking_balance', 'samagri', 'wallet_recharge', 'refund', 'payout'],
        required: true
    },
    // Amount
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    // Payment method
    method: {
        type: String,
        enum: ['upi', 'card', 'netbanking', 'wallet', 'cod', 'bank_transfer']
    },
    // Payment gateway
    gateway: {
        type: String,
        enum: ['razorpay', 'paytm', 'phonepe', 'manual'],
        default: 'razorpay'
    },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    // Status
    status: {
        type: String,
        enum: ['initiated', 'pending', 'success', 'failed', 'refunded', 'cancelled'],
        default: 'initiated'
    },
    failureReason: String,
    // Refund
    refund: {
        id: String,
        amount: Number,
        status: {
            type: String,
            enum: ['not_applicable', 'pending', 'processed', 'failed'],
            default: 'not_applicable'
        },
        processedAt: Date,
        reason: String
    },
    // Metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    // IP and device
    ipAddress: String,
    userAgent: String,
    // Timestamps
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });
paymentSchema.index({ createdAt: -1 });

// Static method to create payment order
paymentSchema.statics.createPaymentOrder = async function(data) {
    const payment = new this({
        booking: data.bookingId,
        user: data.userId,
        type: data.type,
        amount: data.amount,
        method: data.method,
        gateway: data.gateway || 'razorpay',
        status: 'initiated',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
    });
    
    await payment.save();
    return payment;
};

// Method to mark as success
paymentSchema.methods.markAsSuccess = async function(gatewayData) {
    this.status = 'success';
    this.gatewayPaymentId = gatewayData.paymentId;
    this.gatewaySignature = gatewayData.signature;
    this.completedAt = new Date();
    this.metadata = gatewayData.metadata || {};
    
    await this.save();
    
    // Update booking payment status
    if (this.booking) {
        const Booking = mongoose.model('Booking');
        const booking = await Booking.findById(this.booking);
        
        if (booking) {
            if (this.type === 'booking_advance') {
                booking.paymentStatus = 'advance_paid';
            } else if (this.type === 'booking_balance') {
                booking.paymentStatus = 'fully_paid';
            }
            booking.payments.push(this._id);
            await booking.save();
        }
    }
    
    return this;
};

// Method to mark as failed
paymentSchema.methods.markAsFailed = async function(reason) {
    this.status = 'failed';
    this.failureReason = reason;
    this.completedAt = new Date();
    
    await this.save();
    return this;
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
    this.refund = {
        amount: amount || this.amount,
        status: 'processed',
        processedAt: new Date(),
        reason: reason
    };
    this.status = 'refunded';
    
    await this.save();
    return this;
};

module.exports = mongoose.model('Payment', paymentSchema);