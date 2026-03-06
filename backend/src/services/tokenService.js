const jwt = require('jsonwebtoken');

function getRequiredSecret(envKey) {
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`${envKey} is required`);
  }
  return value;
}

function generateAccessToken(userId, refreshTokenVersion) {
  const secret = getRequiredSecret('JWT_ACCESS_SECRET');

  return jwt.sign({ userId, refreshTokenVersion }, secret, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
  });
}

function generateRefreshToken(userId, refreshTokenVersion) {
  const secret = getRequiredSecret('JWT_REFRESH_SECRET');

  return jwt.sign({ userId, refreshTokenVersion }, secret, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getRequiredSecret('JWT_ACCESS_SECRET'));
}

function verifyRefreshToken(token) {
  return jwt.verify(token, getRequiredSecret('JWT_REFRESH_SECRET'));
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
