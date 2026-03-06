const mongoose = require('mongoose');
const { AppError } = require('../utils/appError');

function validateObjectId(id, fieldName = 'id') {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
}

function validateLeagueName(name) {
  if (name == null) return 'My League';

  if (typeof name !== 'string') {
    throw new AppError('name must be a string', 400);
  }

  const trimmed = name.trim();
  if (!trimmed) return 'My League';
  if (trimmed.length > 80) {
    throw new AppError('name must be at most 80 characters', 400);
  }

  return trimmed;
}

module.exports = {
  validateObjectId,
  validateLeagueName,
};
