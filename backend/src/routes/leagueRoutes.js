const express = require("express");

const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  validateObjectId,
  validateLeagueName,
} = require("../validators/leagueValidators");
const {
  listLeaguesForUser,
  createLeagueForUser,
  deleteLeagueForUser,
} = require("../services/leagueService");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const leagues = await listLeaguesForUser(req.userId);
    res.json({ leagues });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const name = validateLeagueName(req.body?.name);
    const league = await createLeagueForUser(req.userId, name);
    res.status(201).json({ league });
  }),
);

router.delete(
  "/:leagueId",
  asyncHandler(async (req, res) => {
    const { leagueId } = req.params;
    validateObjectId(leagueId, "league ID");
    await deleteLeagueForUser(leagueId, req.userId);
    res.status(204).send();
  }),
);

module.exports = router;
