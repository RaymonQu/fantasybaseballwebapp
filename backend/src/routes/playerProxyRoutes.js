const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { callPlayerApi } = require('../services/playerApiClient');

const router = express.Router();
const responseCache = new Map();
const inFlight = new Map();

const CACHE_TTLS_MS = {
  health: 30_000,
  players: 120_000,
};

router.use(requireAuth);

function cacheKey(path, query = {}) {
  const normalized = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value == null) continue;
    normalized.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return `${path}?${normalized.toString()}`;
}

function getFreshCache(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null;
  return entry.payload;
}

function getAnyCache(key) {
  const entry = responseCache.get(key);
  return entry ? entry.payload : null;
}

function setCache(key, payload, ttlMs) {
  responseCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    payload,
  });
}

async function proxyWithCache({
  key,
  ttlMs,
  upstreamRequest,
}) {
  const fresh = getFreshCache(key);
  if (fresh) return fresh;

  const existingRequest = inFlight.get(key);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const result = await upstreamRequest();

    if (result.ok) {
      setCache(key, result, ttlMs);
      return result;
    }

    if (result.status === 429) {
      const cached = getAnyCache(key);
      if (cached) return cached;
    }

    return result;
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const key = cacheKey('/v1/health');
    const result = await proxyWithCache({
      key,
      ttlMs: CACHE_TTLS_MS.health,
      upstreamRequest: () =>
        callPlayerApi({
          path: '/v1/health',
          includeLicense: false,
        }),
    });
    res.status(result.status).json(result.data);
  })
);

router.get(
  '/players',
  asyncHandler(async (req, res) => {
    const key = cacheKey('/v1/players', req.query);
    const result = await proxyWithCache({
      key,
      ttlMs: CACHE_TTLS_MS.players,
      upstreamRequest: () =>
        callPlayerApi({
          path: '/v1/players',
          query: req.query,
        }),
    });
    res.status(result.status).json(result.data);
  })
);

module.exports = router;
