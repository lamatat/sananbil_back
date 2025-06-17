const express = require('express');
const router = express.Router();
const admin = require('../firebase-config');

/**
 * @swagger
 * /api/user/account:
 *   post:
 *     summary: Get user account ID by full name and national ID
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - nationalID
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: User's full name
 *               nationalID:
 *                 type: string
 *                 description: User's national ID
 *     responses:
 *       200:
 *         description: Account ID found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountID:
 *                   type: string
 *                   description: User's account ID
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid request parameters
 */
router.post('/account', async (req, res) => {
  try {
    const { full_name, nationalID } = req.body;

    // Validate input
    if (!full_name || !nationalID) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both full_name and nationalID are required'
      });
    }

    // Query Firestore for the user
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef
      .where('full_name', '==', full_name)
      .where('nationalID', '==', nationalID)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with the provided full name and national ID'
      });
    }

    // Get the first matching user
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    res.json({
      accountID: userData.accountID,
      message: 'Account ID retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching user account:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user account information'
    });
  }
});

module.exports = router; 