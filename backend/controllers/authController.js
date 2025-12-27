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
        // Login can be initiated with either phone OR email.
        // Registration requires phone + email.
        const { phone, email, purpose = 'login' } = req.body;

        const purposeSafe = purpose || 'login';

        // ----------------------------
        // Registration: phone + email required
        // ----------------------------
        if (purposeSafe === 'registration') {
            if (!phone || !isValidIndianPhone(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 10-digit Indian phone number'
                });
            }

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required for registration.'
                });
            }

            const emailToSend = String(email).trim().toLowerCase();

            const existingUser = await User.findOne({ phone });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'An account already exists with this phone number. Please login.'
                });
            }

            // Create OTP and send to the provided email
            const otpDoc = await OTP.createOTP(phone, 'registration', parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10), emailToSend);

            if (process.env.NODE_ENV === 'development') {
                console.log(`📧 OTP for ${phone} (${emailToSend}): ${otpDoc.otp}`);
            }

            try {
                await sendTemplateEmail(emailToSend, 'otp', {
                    otp: otpDoc.otp,
                    purpose: 'complete your registration'
                });
            } catch (e) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP email. Please try again.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your email',
                data: {
                    phone,
                    email: emailToSend,
                    expiresIn: (parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10) * 60),
                    ...(process.env.NODE_ENV === 'development' && { otp: otpDoc.otp })
                }
            });
        }

        // ----------------------------
        // Login: phone OR email
        // ----------------------------
        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either phone or email to login.'
            });
        }

        let user = null;
        let emailToSend = null;
        let phoneForOtp = null;

        if (phone) {
            if (!isValidIndianPhone(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 10-digit Indian phone number'
                });
            }

            user = await User.findOne({ phone });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No account found with this phone number. Please register first.'
                });
            }

            if (!user.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is not set for this account. Please login with email or contact support.'
                });
            }

            emailToSend = user.email;
            phoneForOtp = user.phone;
        } else {
            // email login
            const emailNorm = String(email).trim().toLowerCase();
            user = await User.findOne({ email: emailNorm });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No account found with this email. Please register first.'
                });
            }

            emailToSend = user.email;
            phoneForOtp = user.phone;
        }

        // Create OTP linked to the user's phone, but store the email too.
        // This lets us verify by email or phone.
        const otpDoc = await OTP.createOTP(phoneForOtp, 'login', parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10), emailToSend);

        if (process.env.NODE_ENV === 'development') {
            console.log(`📧 OTP for ${phoneForOtp} (${emailToSend}): ${otpDoc.otp}`);
        }

        try {
            await sendTemplateEmail(emailToSend, 'otp', {
                otp: otpDoc.otp,
                purpose: 'login'
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
            data: {
                // We return both, so frontend can verify with either identifier.
                phone: phoneForOtp,
                email: emailToSend,
                expiresIn: (parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10) * 60),
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
        // Verify can be done with phone OR email (identifier).
        const { phone, email, otp, purpose = 'login' } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        // Find the latest valid OTP doc
        let otpDoc = null;
        if (phone) {
            otpDoc = await OTP.findOne({
                phone,
                purpose,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            }).sort({ createdAt: -1 });
        } else if (email) {
            const emailNorm = String(email).trim().toLowerCase();
            otpDoc = await OTP.findOne({
                email: emailNorm,
                purpose,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            }).sort({ createdAt: -1 });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Phone or email is required'
            });
        }

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new OTP.'
            });
        }

        // Verify OTP (handles attempts + isUsed)
        const verifyResult = await otpDoc.verifyOTP(otp);
        if (!verifyResult.valid) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message,
                attemptsRemaining: verifyResult.attemptsRemaining
            });
        }

        // Always lookup user by phone stored on OTP doc (canonical identifier)
        const phoneForUser = otpDoc.phone;
        const user = await User.findOne({ phone: phoneForUser });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        // Update verification & login time
        user.isPhoneVerified = true;
        user.lastLoginAt = new Date();
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Get pandit profile if user is a pandit
        let panditProfile = null;
        if (user.role === 'pandit') {
            panditProfile = await Pandit.findOne({ user: user._id });
        }

        return res.status(200).json({
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
                } : null
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
        // Email is required because OTP is delivered via email in this MVP
        if (!phone || !fullName || !otp || !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone, full name, email, and OTP are required'
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