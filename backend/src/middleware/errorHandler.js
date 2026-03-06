const { AppError } = require('../utils/appError');

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.name === 'ValidationError') {
    return new AppError('Validation failed', 400, error.errors);
  }

  if (error?.name === 'CastError') {
    return new AppError('Invalid identifier format', 400);
  }

  if (error?.code === 11000) {
    return new AppError('Duplicate value conflict', 409, error.keyValue || null);
  }

  if (Number.isInteger(error?.status)) {
    return new AppError(error.message || 'Request failed', error.status);
  }

  return new AppError('Internal server error', 500);
}

function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (normalized.status >= 500) {
    console.error(err);
  }

  const body = { error: normalized.message };
  if (normalized.details && normalized.expose) {
    body.details = normalized.details;
  }

  res.status(normalized.status).json(body);
}

module.exports = { errorHandler };
