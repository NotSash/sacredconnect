/**
 * ===========================================
 * USER CONTROLLER
 * ===========================================
 */

const User = require('../models/User');

/**
 * @desc    Get current logged-in user
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    return res.status(200).json({
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
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update my profile
 * @route   PUT /api/users/me
 * @access  Private
 */
exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['fullName', 'email', 'preferredLanguage', 'gender', 'dateOfBirth', 'gotra', 'nakshatra'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          fullName: user.fullName,
          profilePhoto: user.profilePhoto,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          gotra: user.gotra,
          nakshatra: user.nakshatra
        }
      }
    });
  } catch (error) {
    next(error);
  }
};