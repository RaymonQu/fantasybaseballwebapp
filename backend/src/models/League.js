const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'My League',
    },
    config: {
      leagueType: {
        type: String,
        enum: ['AL', 'NL', 'MIXED'],
        default: 'MIXED',
      },
      budget: {
        type: Number,
        default: 260,
      },
      rosterSlots: {
        C: { type: Number, default: 1 },
        B1: { type: Number, default: 1 },
        B2: { type: Number, default: 1 },
        B3: { type: Number, default: 1 },
        SS: { type: Number, default: 1 },
        OF: { type: Number, default: 3 },
        UTIL: { type: Number, default: 1 },
        P: { type: Number, default: 9 },
        BN: { type: Number, default: 3 },
      },
      scoring: {
        type: String,
        enum: ['CATEGORY', 'POINTS'],
        default: 'CATEGORY',
      },
      teamNames: {
        type: [String],
        default: ['My Team', "Bob's Team", "Carl's Team", "Don's Team", "Ed's Team"],
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

module.exports = mongoose.model('League', leagueSchema);
