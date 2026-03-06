const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { callPlayerApi } = require('../services/playerApiClient');

const router = express.Router();

router.use(requireAuth);

router.get(
  '/license-status',
  asyncHandler(async (req, res) => {
    const result = await callPlayerApi({
      path: '/v1/license/status',
      method: 'GET',
    });
    res.status(result.status).json(result.data);
  })
);

router.post(
  '/admin/mock-transaction',
  asyncHandler(async (req, res) => {
    const result = await callPlayerApi({
      path: '/v1/admin/mock-transaction',
      method: 'POST',
      body: req.body || {},
      includeAdminSecret: true,
    });
    res.status(result.status).json(result.data);
  })
);

module.exports = router;
