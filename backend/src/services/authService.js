const User = require('../models/User');
const { AppError } = require('../utils/appError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('./tokenService');

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

async function registerUser({ email, password, displayName }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    email,
    displayName,
    passwordHash,
    lastLogin: new Date(),
  });

  return issueTokensForUser(user);
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLogin = new Date();
  await user.save();

  return issueTokensForUser(user);
}

function issueTokensForUser(user) {
  return {
    user: sanitizeUser(user),
    accessToken: generateAccessToken(user._id.toString(), user.refreshTokenVersion),
    refreshToken: generateRefreshToken(user._id.toString(), user.refreshTokenVersion),
  };
}

async function refreshTokens(refreshTokenCookieValue) {
  if (!refreshTokenCookieValue) {
    throw new AppError('Missing refresh token', 401);
  }

  const payload = verifyRefreshToken(refreshTokenCookieValue);
  const user = await User.findById(payload.userId);
  if (!user || user.refreshTokenVersion !== payload.refreshTokenVersion) {
    throw new AppError('Invalid refresh token', 401);
  }

  return issueTokensForUser(user);
}

async function revokeRefreshToken(refreshTokenCookieValue) {
  if (!refreshTokenCookieValue) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshTokenCookieValue);
    const user = await User.findById(payload.userId);
    if (user) {
      user.refreshTokenVersion += 1;
      await user.save();
    }
  } catch (error) {
    // Ignore invalid/expired refresh token during logout.
  }
}

async function getAuthenticatedUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  revokeRefreshToken,
  getAuthenticatedUser,
};
