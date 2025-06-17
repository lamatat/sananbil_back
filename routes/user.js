const express = require('express');
const router = express.Router();
const admin = require('../firebase-config');
const verifyToken = require('../middleware/auth');

/**
 * @swagger
 * /api/user/account:
 *   post:
 *     summary: Get user account ID by national ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nationalID
 *             properties:
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
 *                 full_name:
 *                   type: string
 *                   description: User's full name
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid request parameters
 */
router.post('/account', verifyToken, async (req, res) => {
  try {
    const { nationalID } = req.body;

    // Validate input
    if (!nationalID) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'nationalID is required'
      });
    }

    // Query Firestore for the user
    const usersRef = admin.firestore().collection('user');
    const snapshot = await usersRef
      .where('nationalID', '==', nationalID)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with the provided national ID'
      });
    }

    // Get the first matching user
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    res.json({
      accountID: userData.accountID,
      full_name: userData.full_name,
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

/**
 * @swagger
 * /api/user/all:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User's document ID
 *                       full_name:
 *                         type: string
 *                         description: User's full name
 *                       nationalID:
 *                         type: string
 *                         description: User's national ID
 *                       accountID:
 *                         type: string
 *                         description: User's account ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/all', verifyToken, async (req, res) => {
  try {
    const usersRef = admin.firestore().collection('user');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return res.json({
        users: [],
        message: 'No users found'
      });
    }

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      users,
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
});

module.exports = router; 