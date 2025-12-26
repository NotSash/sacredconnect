/**
 * ===========================================
 * OTP MODEL
 * ===========================================
 */

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['login', 'registration', 'password_reset', 'phone_change', 'email_verify'],
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto delete when expired
    }
}, {
    timestamps: true
});

// Indexes
otpSchema.index({ phone: 1, purpose: 1 });
otpSchema.index({ email: 1, purpose: 1 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
};

// Static method to create and save OTP
// Supports email-based delivery (still indexed by phone+pupose for verification flow)
otpSchema.statics.createOTP = async function(phone, purpose, expiryMinutes = 10, email) {
    // Delete any existing OTPs for this phone and purpose
    await this.deleteMany({ phone, purpose });
    
    // Generate new OTP
    const otp = this.generateOTP();
    
    // Calculate expiry
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    // Create OTP document
    const otpDoc = await this.create({
        phone,
        email: email || undefined,
        otp,
        purpose,
        expiresAt
    });
    
    return otpDoc;
};

// Method to verify OTP
otpSchema.methods.verifyOTP = async function(enteredOTP) {
    // Check if already used
    if (this.isUsed) {
        return { valid: false, message: 'OTP has already been used' };
    }
    
    // Check if expired
    if (this.expiresAt < new Date()) {
        return { valid: false, message: 'OTP has expired' };
    }
    
    // Check max attempts
    if (this.attempts >= 5) {
        return { valid: false, message: 'Maximum attempts exceeded. Please request a new OTP' };
    }
    
    // Increment attempts
    this.attempts += 1;
    await this.save();
    
    // Verify OTP
    if (this.otp !== enteredOTP) {
        return { 
            valid: false, 
            message: `Invalid OTP. ${5 - this.attempts} attempts remaining`,
            attemptsRemaining: 5 - this.attempts
        };
    }
    
    // Mark as used
    this.isUsed = true;
    await this.save();
    
    return { valid: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('OTP', otpSchema);