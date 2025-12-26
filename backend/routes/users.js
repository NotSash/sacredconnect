/**
 * ===========================================
 * USER ROUTES
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMe,
  updateMe
} = require('../controllers/userController');

// All user routes require auth
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;