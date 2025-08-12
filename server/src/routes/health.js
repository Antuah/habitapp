const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

module.exports = router;