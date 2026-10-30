const express = require('express');
const {
  register,
  login,
  googleAuth,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  sendOTP,
  verifyOTP,
  getOrganizations,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  handleValidationErrors,
} = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Public registration & login
router.post(
  '/register',
  authLimiter,
  [validateEmail, validatePassword, validateUsername, validatePhoneNumber],
  handleValidationErrors,
  register
);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);

// Email Verification
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);

// Password Recovery
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// OTP Verification
router.post('/send-otp', authLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);

// Session & User
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.get('/organizations', getOrganizations);

module.exports = router;
