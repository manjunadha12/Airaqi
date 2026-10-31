const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Organization = require('../models/Organization');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../config/jwt');
const { generateOTP, generateToken } = require('../utils/helpers');
const {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.includes('your_google_client_id')) {
    return null;
  }
  return new OAuth2Client(clientId);
};

// Parse client User-Agent into clean device type, OS, and browser
function parseUserAgent(ua = '', ip = '') {
  let deviceType = 'desktop';
  let os = 'Unknown OS';
  let browser = 'Browser';

  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android (\d+)/i.test(ua)) {
    const match = ua.match(/android (\d+(\.\d+)?)/i);
    os = match ? ('Android ' + match[1]) : 'Android';
  } else if (/iphone os (\d+)/i.test(ua)) {
    const match = ua.match(/iphone os (\d+(_\d+)?)/i);
    os = match ? ('iOS ' + match[1].replace(/_/g, '.')) : 'iOS';
  } else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  if (/edg\/(\d+)/i.test(ua)) browser = 'Microsoft Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua) && !/opr/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = 'Apple Safari';

  let deviceName = '';
  if (deviceType === 'mobile') {
    deviceName = (os.includes('Android') ? 'Android Smartphone' : os.includes('iOS') ? 'iPhone' : 'Mobile Device') + ' • ' + browser;
  } else if (deviceType === 'tablet') {
    deviceName = (os.includes('iOS') ? 'iPad' : 'Tablet') + ' • ' + browser;
  } else {
    deviceName = os + ' PC / Laptop • ' + browser;
  }

  return { deviceType, os, browser, deviceName };
}

function registerUserSession(user, req, customLocation = null) {
  if (!user.activeSessions) {
    user.activeSessions = [];
  }

  const ua = req.headers['user-agent'] || '';
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
  const parsed = parseUserAgent(ua, clientIP);

  const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
  const location = customLocation || (clientIP.includes('::1') || clientIP.includes('127.0.0.1') ? 'Localhost (Development)' : 'India (Online)');

  const newSession = {
    sessionId,
    deviceType: parsed.deviceType,
    deviceName: parsed.deviceName,
    browser: parsed.browser,
    os: parsed.os,
    ip: clientIP,
    location,
    userAgent: ua.substring(0, 250),
    lastActive: new Date(),
    createdAt: new Date(),
  };

  user.activeSessions.unshift(newSession);

  if (user.activeSessions.length > 15) {
    user.activeSessions = user.activeSessions.slice(0, 15);
  }

  return sessionId;
}
// Register User
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || cleanEmail.split('@')[0])
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      const isEmailMatch = existingUser.email === cleanEmail;
      return res.status(400).json({
        success: false,
        message: isEmailMatch
          ? 'An account with this email address already exists.'
          : 'This username is already taken. Please choose another.',
      });
    }

    // Generate email verification token and 6-digit OTP
    const emailVerificationToken = generateToken();
    const otp = generateOTP();

    // Create new unverified user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : null,
      authProvider: 'local',
      isEmailVerified: false, // Strict: Never auto-verify!
      emailVerificationToken,
      emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      otpToken: otp,
      otpTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        cleanEmail,
        emailVerificationToken,
        `${user.firstName} ${user.lastName}`,
        otp
      );
      console.log(`✓ Verification email & OTP [${otp}] successfully dispatched to ${cleanEmail}`);
    } catch (emailError) {
      console.warn('Notice: Verification email dispatch encountered an issue:', emailError.message);
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Account created successfully! Please verify your email with the 6-digit code.',
      email: cleanEmail,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email/username and password.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user by email, username, or phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: cleanIdentifier },
        { phone: identifier.trim() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your details and try again.',
      });
    }

    // If account was created via Google and has no local password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered using Google. Please sign in with Google.',
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your details and try again.',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address has not been verified yet. Please verify your account before logging in.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Register active device session
    const clientLocation = req.body.location || null;
    const sessionId = registerUserSession(user, req, clientLocation);

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      sessionId,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// Google OAuth Authentication
exports.googleAuth = async (req, res) => {
  try {
    const { credential, mode = 'login', allowCreate = false } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization credential is required',
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    let payload = null;

    if (!clientId || clientId.includes('your_google_client_id')) {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in backend/.env.',
      });
    }

    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google authentication token. Please try again.',
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Could not retrieve verified email from Google account.',
      });
    }

    const googleEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;

    // Find existing user by Google ID or Email
    let user = await User.findOne({
      $or: [{ googleId }, { email: googleEmail }],
    });

    // Check if mode is 'login' and creation is not explicitly permitted
    if (mode === 'login' && !allowCreate && !user) {
      return res.status(404).json({
        success: false,
        accountNotFound: true,
        message: `No AQI account found for ${googleEmail}. Please create an account to continue.`,
        googleUser: {
          email: googleEmail,
          firstName: payload.given_name || payload.name?.split(' ')[0] || 'User',
          lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
          picture: payload.picture || null,
          googleId,
          credential,
        },
      });
    }

    if (user) {
      // Link Google ID if not linked yet
      if (!user.googleId) {
        user.googleId = googleId;
      }
      // If email is verified by Google, mark verified
      if (payload.email_verified) {
        user.isEmailVerified = true;
      }
      if (payload.picture && !user.profilePicture) {
        user.profilePicture = payload.picture;
      }
      user.lastLogin = new Date();
      user.lastLoginIP = req.ip || req.connection.remoteAddress;
      await user.save();
    } else {
      // Create new user via Google (triggered from register or after confirming create next step)
      const baseUsername = googleEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_');
      let uniqueUsername = baseUsername;
      const count = await User.countDocuments({ username: new RegExp(`^${baseUsername}`, 'i') });
      if (count > 0) {
        uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      user = new User({
        firstName: payload.given_name || payload.name?.split(' ')[0] || 'User',
        lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
        username: uniqueUsername,
        email: googleEmail,
        authProvider: 'google',
        googleId,
        isEmailVerified: true, // Google already verified email
        profilePicture: payload.picture || null,
        lastLogin: new Date(),
        lastLoginIP: req.ip || req.connection.remoteAddress,
      });

      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const clientLocation = req.body.location || null;
    const sessionId = registerUserSession(user, req, clientLocation);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      accessToken,
      refreshToken,
      sessionId,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed',
    });
  }
};

// Get Current User Profile (Protected)
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update User Profile (Protected)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const { firstName, lastName, phone, department, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
        notifications: {
          ...user.preferences?.notifications,
          ...preferences.notifications,
        },
      };
    }

    // Add to audit log
    if (!user.auditLog) user.auditLog = [];
    user.auditLog.unshift({
      action: 'Profile and preferences updated',
      timestamp: new Date(),
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    if (user.auditLog.length > 20) user.auditLog = user.auditLog.slice(0, 20);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

// Change Password (Protected)
exports.changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.authProvider === 'google' && !user.password) {
      user.password = newPassword;
      user.authProvider = 'local';
    } else {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'The current password you provided is incorrect',
        });
      }
      user.password = newPassword;
    }

    // Add to audit log
    if (!user.auditLog) user.auditLog = [];
    user.auditLog.unshift({
      action: 'Security password changed successfully',
      timestamp: new Date(),
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    if (user.auditLog.length > 20) user.auditLog = user.auditLog.slice(0, 20);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token, otp, email } = req.body;

    let user = null;

    if (token) {
      user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpiry: { $gt: new Date() },
      });
    } else if (otp && email) {
      user = await User.findOne({
        email: email.toLowerCase().trim(),
        otpToken: otp.trim(),
        otpTokenExpiry: { $gt: new Date() },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token or code. Please request a new one.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.otpToken = undefined;
    user.otpTokenExpiry = undefined;
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip || req.connection?.remoteAddress;
    await user.save();

    // Auto-login upon verification
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    const sessionId = registerUserSession(user, req);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to AirSense Cloud.',
      accessToken,
      refreshToken,
      sessionId,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Email verification failed',
    });
  }
};

// Resend Verification Email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Don't leak whether email exists
      return res.status(200).json({
        success: true,
        message: 'If an unverified account exists with this email, a new verification message has been sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please sign in.',
      });
    }

    // Generate new token & OTP
    const emailVerificationToken = generateToken();
    const otp = generateOTP();

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.otpToken = otp;
    user.otpTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(
        cleanEmail,
        emailVerificationToken,
        `${user.firstName} ${user.lastName}`,
        otp
      );
    } catch (e) {
      console.warn('Notice: Verification email dispatch issue:', e.message);
    }

    res.status(200).json({
      success: true,
      message: 'A new verification link and code has been sent to your email.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend verification',
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Always return generic response to prevent email harvesting
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email address, password reset instructions have been sent.',
      });
    }

    const resetToken = generateToken();
    const otp = generateOTP();

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.otpToken = otp;
    user.otpTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(
        cleanEmail,
        resetToken,
        `${user.firstName} ${user.lastName}`,
        otp
      );
      console.log(`✓ Verification email & OTP [${otp}] successfully dispatched to ${cleanEmail}`);
    } catch (emailError) {
      console.warn('Notice: Password reset email dispatch issue:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password recovery',
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, otp, email, password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    let user = null;

    if (token) {
      user = await User.findOne({
        passwordResetToken: token,
        passwordResetTokenExpiry: { $gt: new Date() },
      });
    } else if (otp && email) {
      user = await User.findOne({
        email: email.toLowerCase().trim(),
        otpToken: otp.trim(),
        otpTokenExpiry: { $gt: new Date() },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link/code. Please request a new one.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.otpToken = undefined;
    user.otpTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User session expired or user not found',
      });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token',
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    user.otpToken = otp;
    user.otpTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(user.email, otp, `${user.firstName} ${user.lastName}`);
      console.log(`✓ OTP [${otp}] dispatched to ${user.email}`);
    } catch (e) {
      console.warn('OTP email dispatch issue:', e.message);
    }

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      otpToken: otp.trim(),
      otpTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.otpToken = undefined;
    user.otpTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all organizations
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({ isActive: true }).select('name _id');
    res.status(200).json({
      success: true,
      organizations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all active sessions for current user
exports.getActiveSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.activeSessions) user.activeSessions = [];

    const incomingSessionId = req.headers['x-session-id'] || req.query.sessionId;
    const ua = req.headers['user-agent'] || '';
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
    const parsed = parseUserAgent(ua, clientIP);
    const clientLocation = req.query.location || null;

    let matchedSession = null;

    // 1. Check if incomingSessionId matches an existing session
    if (incomingSessionId) {
      matchedSession = user.activeSessions.find((s) => s.sessionId === incomingSessionId);
    }

    // 2. Fallback: match by deviceType + OS + browser
    if (!matchedSession) {
      matchedSession = user.activeSessions.find(
        (s) => s.deviceType === parsed.deviceType && s.os === parsed.os && s.browser === parsed.browser
      );
    }

    let currentSessionId;

    if (matchedSession) {
      matchedSession.lastActive = new Date();
      if (clientLocation) matchedSession.location = clientLocation;
      if (clientIP) matchedSession.ip = clientIP;
      currentSessionId = matchedSession.sessionId;
    } else {
      // Auto-register session for this device
      currentSessionId = registerUserSession(user, req, clientLocation);
    }

    await user.save();

    res.status(200).json({
      success: true,
      sessions: user.activeSessions,
      currentSessionId,
    });
  } catch (error) {
    console.error('getActiveSessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active sessions',
    });
  }
};

// Terminate a specific session (Log Out Device)
exports.deleteSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { sessionId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.activeSessions) user.activeSessions = [];

    user.activeSessions = user.activeSessions.filter((s) => s.sessionId !== sessionId);

    if (!user.auditLog) user.auditLog = [];
    user.auditLog.unshift({
      action: `Device session revoked (${sessionId})`,
      timestamp: new Date(),
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Device session logged out successfully',
      sessions: user.activeSessions,
    });
  } catch (error) {
    console.error('deleteSession error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to log out device session',
    });
  }
};

// Terminate all other sessions (Log Out All Other Devices)
exports.deleteAllOtherSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const currentSessionId = req.headers['x-session-id'] || req.body?.currentSessionId;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.activeSessions) user.activeSessions = [];

    if (currentSessionId) {
      user.activeSessions = user.activeSessions.filter((s) => s.sessionId === currentSessionId);
    } else if (user.activeSessions.length > 0) {
      user.activeSessions = [user.activeSessions[0]];
    }

    if (!user.auditLog) user.auditLog = [];
    user.auditLog.unshift({
      action: 'Terminated all other active device sessions',
      timestamp: new Date(),
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'All other device sessions have been logged out successfully',
      sessions: user.activeSessions,
    });
  } catch (error) {
    console.error('deleteAllOtherSessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to log out other device sessions',
    });
  }
};
