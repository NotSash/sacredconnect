/**
 * ===========================================
 * ADMIN CONTROLLER
 * ===========================================
 */

const User = require('../models/User');
const Pandit = require('../models/Pandit');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const { PANDIT_STATUS } = require('../config/constants');

/**
 * @desc    Admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      users,
      pandits,
      pendingPandits,
      categories,
      services,
      bookings,
      reviews
    ] = await Promise.all([
      User.countDocuments({}),
      Pandit.countDocuments({}),
      Pandit.countDocuments({ status: PANDIT_STATUS.PENDING }),
      Category.countDocuments({}),
      Service.countDocuments({}),
      Booking.countDocuments({}),
      Review.countDocuments({})
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pandits,
        pendingPandits,
        categories,
        services,
        bookings,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List pending pandit verifications
 * @route   GET /api/admin/pandits/pending
 * @access  Private/Admin
 */
/**
 * @desc    Approve/verify a pandit
 * @route   PUT /api/admin/pandits/:id/approve
 * @access  Private/Admin
 */
exports.approvePandit = async (req, res, next) => {
  try {
    const { verificationLevel = 'verified' } = req.body || {};

    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }

    pandit.status = PANDIT_STATUS.ACTIVE;
    pandit.verificationLevel = verificationLevel;
    pandit.approvedAt = new Date();
    pandit.approvedBy = req.user._id;
    await pandit.save();

    // ensure user role is pandit
    await User.findByIdAndUpdate(pandit.user, { role: 'pandit' });

    return res.status(200).json({
      success: true,
      message: 'Pandit approved',
      data: { id: pandit._id, status: pandit.status, verificationLevel: pandit.verificationLevel }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pandit application
 * @route   PUT /api/admin/pandits/:id/reject
 * @access  Private/Admin
 */
exports.rejectPandit = async (req, res, next) => {
  try {
    const { reason = '' } = req.body || {};

    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }

    pandit.status = PANDIT_STATUS.INACTIVE;
    pandit.suspensionReason = reason || 'Rejected by admin';
    pandit.suspendedAt = new Date();
    await pandit.save();

    return res.status(200).json({
      success: true,
      message: 'Pandit rejected',
      data: { id: pandit._id, status: pandit.status }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPendingPandits = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { status: PANDIT_STATUS.PENDING };

    const total = await Pandit.countDocuments(query);

    const pandits = await Pandit.find(query)
      .populate('user', 'fullName phone email profilePhoto createdAt')
      .select('displayName baseCity yearsOfExperience languages verificationLevel status profileCompleteness createdAt')
      .sort({ createdAt: -1, _id: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const formatted = pandits.map(p => ({
      id: p._id,
      displayName: p.displayName,
      baseCity: p.baseCity,
      yearsOfExperience: p.yearsOfExperience,
      languages: p.languages,
      verificationLevel: p.verificationLevel,
      status: p.status,
      profileCompleteness: p.profileCompleteness,
      createdAt: p.createdAt,
      user: p.user ? {
        id: p.user._id,
        fullName: p.user.fullName,
        phone: p.user.phone,
        email: p.user.email,
        profilePhoto: p.user.profilePhoto,
        createdAt: p.user.createdAt
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};