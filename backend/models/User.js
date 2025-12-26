/**
 * ===========================================
 * USER MODEL
 * ===========================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    gotra: {
        type: String,
        trim: true
    },
    nakshatra: {
        type: String,
        trim: true
    },
    preferredLanguage: {
        type: String,
        default: 'Hindi'
    },
    role: {
        type: String,
        enum: ['user', 'pandit', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active'
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    addresses: [{
        type: {
            type: String,
            enum: ['home', 'office', 'temple', 'other'],
            default: 'home'
        },
        label: String,
        fullAddress: String,
        flatNumber: String,
        buildingName: String,
        street: String,
        locality: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String,
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
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    familyMembers: [{
        name: String,
        relation: {
            type: String,
            enum: ['self', 'spouse', 'father', 'mother', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'other']
        },
        dateOfBirth: Date,
        gotra: String,
        nakshatra: String
    }],
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    walletBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    rewardPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    favorites: {
        pandits: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pandit'
        }],
        services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        }]
    },
    notificationPreferences: {
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        promotional: { type: Boolean, default: true }
    },
    lastLoginAt: {
        type: Date
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ 'addresses.location': '2dsphere' });

// Virtual for pandit profile if user is a pandit
userSchema.virtual('panditProfile', {
    ref: 'Pandit',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
    // Generate referral code if not exists
    if (!this.referralCode) {
        const code = this.fullName.substring(0, 3).toUpperCase() + 
                     Math.random().toString(36).substring(2, 7).toUpperCase();
        this.referralCode = code;
    }
    
    // Hash password if modified
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            id: this._id, 
            role: this.role,
            phone: this.phone 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// Get public profile (hide sensitive data)
userSchema.methods.toPublicProfile = function() {
    return {
        id: this._id,
        fullName: this.fullName,
        profilePhoto: this.profilePhoto,
        phone: this.phone.substring(0, 2) + 'XXXXXX' + this.phone.substring(8),
        role: this.role,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);