const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
