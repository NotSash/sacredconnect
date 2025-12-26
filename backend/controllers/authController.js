/**
 * ===========================================
 * AUTHENTICATION CONTROLLER
 * ===========================================
 */

const User = require('../models/User');
const OTP = require('../models/OTP');
const Pandit = require('../models/Pandit');
const { generateOTP, isValidIndianPhone } = require('../utils/helpers');
const { sendTemplateEmail } = require('../utils/email');

/**
 * @desc    Send OTP for login/registration
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = async (req, res, next) => {
    try {
        const { phone, purpose = 'login' } = req.body;
        
        // Validate phone
        if (!phone || !isValidIndianPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit Indian phone number'
            });
        }
        
        // Check if user exists (for login vs registration)
        const existingUser = await User.findOne({ phone });
        
        if (purpose === 'login' && !existingUser) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number. Please register first.'
            });
        }
        
        if (purpose === 'registration' && existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account already exists with this phone number. Please login.'
            });
        }
        
        // Create OTP
        const otpDoc = await OTP.createOTP(phone, purpose);
        
        // In development, log OTP (in production, send via SMS)
        if (process.env.NODE_ENV === 'development') {
            console.log(`📱 OTP for ${phone}: ${otpDoc.otp}`);
        }
        
        // TODO: Integrate SMS gateway (MSG91, Twilio, etc.)
        // await sendSMS(phone, `Your SacredConnect OTP is ${otpDoc.otp}. Valid for 10 minutes.`);
        
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                phone,
                expiresIn: 10 * 60, // 10 minutes in seconds
                // Include OTP in dev mode for testing
                ...(process.env.NODE_ENV === 'development' && { otp: otpDoc.otp })
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify OTP and login
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { phone, otp, purpose = 'login' } = req.body;
        
        // Validate inputs
        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }
        
        // Find OTP document
        const otpDoc = await OTP.findOne({
            phone,
            purpose,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new OTP.'
            });
        }
        
        // Verify OTP
        const result = await otpDoc.verifyOTP(otp);
        
        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message,
                attemptsRemaining: result.attemptsRemaining
            });
        }
        
        // Get or create user
        let user = await User.findOne({ phone });
        let isNewUser = false;
        
        if (!user && purpose === 'registration') {
            // This shouldn't happen as registration has a separate endpoint
            // But handle it gracefully
            user = await User.create({
                phone,
                fullName: 'User',
                isPhoneVerified: true
            });
            isNewUser = true;
        } else if (user) {
            // Update phone verification status
            user.isPhoneVerified = true;
            user.lastLoginAt = new Date();
            await user.save();
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }
        
        // Generate token
        const token = user.generateAuthToken();
        
        // Get pandit profile if user is a pandit
        let panditProfile = null;
        if (user.role === 'pandit') {
            panditProfile = await Pandit.findOne({ user: user._id });
        }
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    phone: user.phone,
                    email: user.email,
                    fullName: user.fullName,
                    profilePhoto: user.profilePhoto,
                    role: user.role,
                    isPhoneVerified: user.isPhoneVerified,
                    isEmailVerified: user.isEmailVerified
                },
                panditProfile: panditProfile ? {
                    id: panditProfile._id,
                    displayName: panditProfile.displayName,
                    status: panditProfile.status,
                    verificationLevel: panditProfile.verificationLevel
                } : null,
                isNewUser
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { phone, fullName, email, otp } = req.body;
        
        // Validate required fields
        if (!phone || !fullName || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone, full name, and OTP are required'
            });
        }
        
        // Validate phone
        if (!isValidIndianPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit Indian phone number'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account already exists with this phone number'
            });
        }
        
        // Verify OTP
        const otpDoc = await OTP.findOne({
            phone,
            purpose: 'registration',
            isUsed: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new OTP.'
            });
        }
        
        const otpResult = await otpDoc.verifyOTP(otp);
        if (!otpResult.valid) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }
        
        // Create user
        const user = await User.create({
            phone,
            fullName,
            email,
            isPhoneVerified: true
        });
        
        // Send welcome email if email provided
        if (email) {
            await sendTemplateEmail(email, 'welcome', user.fullName);
        }
        
        // Generate token
        const token = user.generateAuthToken();
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: {
                    id: user._id,
                    phone: user.phone,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    referralCode: user.referralCode
                }
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Register as a Pandit
 * @route   POST /api/auth/register-pandit
 * @access  Public
 */
exports.registerPandit = async (req, res, next) => {
    try {
        const { 
            phone, 
            fullName, 
            email, 
            otp,
            displayName,
            yearsOfExperience,
            languages,
            baseCity,
            specializations
        } = req.body;
        
        // Validate required fields
        if (!phone || !fullName || !otp || !displayName || !baseCity) {
            return res.status(400).json({
                success: false,
                message: 'Phone, name, OTP, display name, and city are required'
            });
        }
        
        // Verify OTP
        const otpDoc = await OTP.findOne({
            phone,
            purpose: 'registration',
            isUsed: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new OTP.'
            });
        }
        
        const otpResult = await otpDoc.verifyOTP(otp);
        if (!otpResult.valid) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }
        
        // Check if user exists
        let user = await User.findOne({ phone });
        
        if (user) {
            // User exists, check if already a pandit
            const existingPandit = await Pandit.findOne({ user: user._id });
            if (existingPandit) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already registered as a Pandit'
                });
            }
            // Update user role
            user.role = 'pandit';
            user.fullName = fullName;
            if (email) user.email = email;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                phone,
                fullName,
                email,
                role: 'pandit',
                isPhoneVerified: true
            });
        }
        
        // Create pandit profile
        const pandit = await Pandit.create({
            user: user._id,
            displayName,
            yearsOfExperience: yearsOfExperience || 0,
            languages: languages || ['Hindi'],
            baseCity,
            specializations: specializations || [],
            status: 'pending_verification'
        });
        
        // Send welcome email
        if (email) {
            await sendTemplateEmail(email, 'panditWelcome', displayName);
        }
        
        // Generate token
        const token = user.generateAuthToken();
        
        res.status(201).json({
            success: true,
            message: 'Pandit registration successful. Your profile is pending verification.',
            data: {
                token,
                user: {
                    id: user._id,
                    phone: user.phone,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                },
                pandit: {
                    id: pandit._id,
                    displayName: pandit.displayName,
                    status: pandit.status
                }
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        let panditProfile = null;
        if (user.role === 'pandit') {
            panditProfile = await Pandit.findOne({ user: user._id })
                .select('displayName status verificationLevel stats profileCompleteness');
        }
        
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    phone: user.phone,
                    email: user.email,
                    fullName: user.fullName,
                    profilePhoto: user.profilePhoto,
                    role: user.role,
                    isPhoneVerified: user.isPhoneVerified,
                    isEmailVerified: user.isEmailVerified,
                    walletBalance: user.walletBalance,
                    rewardPoints: user.rewardPoints,
                    referralCode: user.referralCode,
                    addresses: user.addresses,
                    createdAt: user.createdAt
                },
                panditProfile
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout (client-side token removal, but we can track)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
    try {
        // In a more complex system, you'd invalidate the token here
        // For now, just return success (client removes token)
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        
        const token = user.generateAuthToken();
        
        res.status(200).json({
            success: true,
            data: { token }
        });
        
    } catch (error) {
        next(error);
    }
};