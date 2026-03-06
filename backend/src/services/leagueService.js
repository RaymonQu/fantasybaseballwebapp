const League = require('../models/League');
const { AppError } = require('../utils/appError');

async function listLeaguesForUser(userId) {
  return League.find({ ownerId: userId }).sort({ createdAt: -1 });
}

async function createLeagueForUser(userId, name) {
  return League.create({
    ownerId: userId,
    name,
  });
}

async function deleteLeagueForUser(leagueId, userId) {
  const league = await League.findOne({ _id: leagueId, ownerId: userId });
  if (!league) {
    throw new AppError('League not found', 404);
  }
  await League.deleteOne({ _id: league._id, ownerId: userId });
}

module.exports = {
  listLeaguesForUser,
  createLeagueForUser,
  deleteLeagueForUser,
};
