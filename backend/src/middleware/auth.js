const { verifyAccessToken } = require('../services/tokenService');
const { ACCESS_COOKIE } = require('../utils/cookies');
const { AppError } = require('../utils/appError');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const token = req.cookies[ACCESS_COOKIE];
  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select('_id refreshTokenVersion');
    if (!user) {
      return next(new AppError('Authentication required', 401));
    }

    if (payload.refreshTokenVersion !== user.refreshTokenVersion) {
      return next(new AppError('Session no longer valid. Please login again.', 401));
    }

    req.userId = payload.userId;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, { code: 'TOKEN_EXPIRED' }));
    }
    return next(new AppError('Invalid token', 401));
  }
}

module.exports = { requireAuth };
