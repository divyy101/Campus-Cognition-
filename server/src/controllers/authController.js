const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Activity = require('../models/Activity');
const env = require('../config/env');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const cleanUsername = (username || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account already exists with this email address.' });
    }

    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(409).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: passwordHash,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    const token = generateToken(user._id);

    await Activity.create({
      user: user._id,
      type: 'SIGNUP',
      description: 'New user account registered'
    });

    // Send welcome email asynchronously
    sendWelcomeEmail(user).catch(err => console.error('[Auth] Welcome email failed:', err));

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        branch: user.branch,
        cgpa: user.cgpa
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password.' });
    }

    const cleanInput = username.trim();
    // Allow login by either username or email
    const user = await User.findOne({
      $or: [
        { username: cleanInput },
        { email: cleanInput.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = generateToken(user._id);

    await Activity.create({
      user: user._id,
      type: 'LOGIN',
      description: `User logged in at ${new Date().toISOString()}`
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        branch: user.branch,
        cgpa: user.cgpa,
        aiEngine: user.aiEngine
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password link request
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashToken;
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
      await user.save();

      const resetUrl = `${env.frontendUrl}/reset-password/${resetToken}`;
      sendPasswordResetEmail(user, resetUrl).catch(e => console.error('[Auth] Reset email failed:', e));
    }

    res.json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await Activity.create({
      user: user._id,
      type: 'PASSWORD_RESET',
      description: 'Password reset using link'
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password (authenticated)
// @route   POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await Activity.create({
      user: user._id,
      type: 'PASSWORD_CHANGE',
      description: 'Password changed from profile settings'
    });

    res.json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await Activity.create({
        user: req.user._id,
        type: 'LOGOUT',
        description: 'User logged out'
      });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};
