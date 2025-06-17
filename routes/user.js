const express = require('express');
const router = express.Router();
const admin = require('../firebase-config');
const verifyToken = require('../middleware/auth');
const { hybridApproval } = require('../controllers/creditDecision');
const axios = require('axios');

/**
 * @swagger
 * /api/user/account:
 *   post:
 *     summary: Get user account ID and credit score by national ID
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
 *               - loanAmount
 *             properties:
 *               nationalID:
 *                 type: string
 *                 description: User's national ID
 *               loanAmount:
 *                 type: number
 *                 description: Requested loan amount in SAR
 *     responses:
 *       200:
 *         description: Account ID and credit score retrieved successfully
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
 *                 credit_decision:
 *                   type: object
 *                   properties:
 *                     decision:
 *                       type: string
 *                       enum: [Approve, Reject]
 *                     reason:
 *                       type: string
 *                     details:
 *                       type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid request parameters
 */
router.post('/account', verifyToken, async (req, res) => {
  try {
    const { nationalID, loanAmount } = req.body;

    // Validate input
    if (!nationalID || !loanAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'nationalID and loanAmount are required'
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

    // Fetch data from Tarabut APIs
    const baseUrl = 'https://sananbil-back.vercel.app/api/tarabut';
    const token = req.headers.authorization;

    try {
      const [
        balanceResponse,
        transactionsResponse,
        balanceInsightsResponse,
        incomeInsightsResponse,
        transactionInsightsResponse,
        spendingInsightsResponse
      ] = await Promise.all([
        axios.get(`${baseUrl}/balance?accountId=${userData.accountID}`, { headers: { Authorization: token } }),
        axios.get(`${baseUrl}/transactions?accountId=${userData.accountID}`, { headers: { Authorization: token } }),
        axios.get(`${baseUrl}/balance-insights?accountId=${userData.accountID}`, { headers: { Authorization: token } }),
        axios.get(`${baseUrl}/income-insights?accountId=${userData.accountID}`, { headers: { Authorization: token } }),
        axios.get(`${baseUrl}/transaction-insights?accountId=${userData.accountID}`, { headers: { Authorization: token } }),
        axios.get(`${baseUrl}/spending-insights?accountId=${userData.accountID}`, { headers: { Authorization: token } })
      ]);

      // Validate and structure the data
      const combinedData = {
        accountBalance: balanceResponse.data || { balances: [{ amount: { value: 0 } }] },
        transactions: transactionsResponse.data?.transactions || [],
        balanceInsights: balanceInsightsResponse.data || { trend: 'neutral' },
        incomeInsights: incomeInsightsResponse.data || {
          accounts: [{
            recurringCreditSummary: [{ avgAmount: 0 }]
          }]
        },
        transactionInsights: transactionInsightsResponse.data || {},
        spendingInsights: spendingInsightsResponse.data || {
          accounts: [{
            recurringDebitSummary: [{ avgAmount: 0 }]
          }]
        }
      };

      // Get credit decision
      const creditDecision = await hybridApproval(combinedData, loanAmount);

      res.json({
        accountID: userData.accountID,
        full_name: userData.full_name,
        credit_decision: creditDecision,
        message: 'Account information and credit decision retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching Tarabut data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch financial data: ' + error.message
      });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process request: ' + error.message
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