const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/bank/health:
 *   get:
 *     summary: Check bank API health
 *     tags: [Bank]
 *     responses:
 *       200:
 *         description: Bank API is healthy
 */
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Bank API is running' });
});

module.exports = router; 