const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { callPlayerApi } = require('../services/playerApiClient');

const router = express.Router();

router.use(requireAuth);

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const result = await callPlayerApi({
      path: '/v1/health',
      includeLicense: false,
    });
    res.status(result.status).json(result.data);
  })
);

router.get(
  '/players',
  asyncHandler(async (req, res) => {
    const result = await callPlayerApi({
      path: '/v1/players',
      query: req.query,
    });
    res.status(result.status).json(result.data);
  })
);

module.exports = router;
