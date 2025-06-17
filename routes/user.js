const express = require('express');
const router = express.Router();
const admin = require('../firebase-config');
const verifyToken = require('../middleware/auth');
const { hybridApproval } = require('../controllers/creditDecision');
const axios = require('axios');
const { getDatabase } = require('firebase-admin/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to authentication routes
router.use('/login', authLimiter);
router.use('/register', authLimiter);

// Rate limiting configuration for authentication
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { 
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    status: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use both IP and username for rate limiting to prevent targeted attacks
    return `${req.ip}-${req.body.username || 'unknown'}`;
  }
});

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

/**
 * @swagger
 * /api/user/test-env:
 *   get:
 *     summary: Test environment variables
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Environment variables status
 */
router.get('/test-env', (req, res) => {
  res.json({
    openai_key_set: process.env.OPENAI_API_KEY ? 'Yes' : 'No',
    openai_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    node_env: process.env.NODE_ENV
  });
});

// Apply rate limiting to login endpoint
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = getDatabase();
    const userRef = db.ref('users');
    const snapshot = await userRef.orderByChild('username').equalTo(username).once('value');
    const userData = snapshot.val();

    if (!userData) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userId = Object.keys(userData)[0];
    const user = userData[userId];

    // Using the new Promise-based bcrypt.compare
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { 
        userId,
        username: user.username,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userId,
        username: user.username,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password hashing in registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    const db = getDatabase();
    const userRef = db.ref('users');
    
    // Check if username already exists
    const snapshot = await userRef.orderByChild('username').equalTo(username).once('value');
    if (snapshot.exists()) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password using the new Promise-based bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const newUserRef = await userRef.push(newUser);
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUserRef.key
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 