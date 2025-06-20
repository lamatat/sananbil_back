require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const admin = require('./firebase-config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bankRouter = require('./routes/bank');
const tarabutRouter = require('./routes/tarabut');
const userRouter = require('./routes/user');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security
app.disable('x-powered-by'); // Explicitly disable X-Powered-By header

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Log environment variables (without sensitive values)
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
  VERCEL_URL: process.env.VERCEL_URL || 'Not set'
});

// CORS configuration - More permissive for development
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Middleware
app.use(cors(corsOptions));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sananbil API Documentation',
      version: '1.0.0',
      description: 'API documentation for Sananbil application',
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

// API Routes
const router = express.Router();

/**
 * @swagger
 * /api/test-firebase:
 *   get:
 *     summary: Test Firebase Connection
 *     description: Tests the connection to Firebase by attempting to write and read from Firestore
 *     tags: [Firebase]
 *     responses:
 *       200:
 *         description: Firebase connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully connected to Firebase
 *                 data:
 *                   type: object
 *                   example: { test: "data" }
 *       500:
 *         description: Firebase connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to connect to Firebase
 */
router.get('/test-firebase', async (req, res) => {
  try {
    // Get Firestore instance
    const db = admin.firestore();
    
    // Create a test document
    const testDoc = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Test connection successful'
    };
    
    // Write to Firestore
    await db.collection('test').doc('connection-test').set(testDoc);
    
    // Read from Firestore
    const doc = await db.collection('test').doc('connection-test').get();
    
    res.status(200).json({
      success: true,
      message: 'Successfully connected to Firebase',
      data: doc.data()
    });
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Firebase: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Returns a hello message
 *     description: Returns a simple hello message from the server
 *     responses:
 *       200:
 *         description: A hello message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hello from Node.js server!
 */
router.get('/hello', (req, res) => {
  res.status(200).send('Hello from Node.js server!\n');
});

/**
 * @swagger
 * /api/bank/register:
 *   post:
 *     summary: Register a new bank user
 *     description: Creates a new bank user with encrypted password
 *     tags: [Bank]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankUser'
 *     responses:
 *       201:
 *         description: Bank user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bank user created successfully
 *                 data:
 *                   $ref: '#/components/schemas/BankUserResponse'
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/bank/register', async (req, res) => {
  try {
    const { username, password, bank_name } = req.body;

    // Validate input
    if (!username || !password || !bank_name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and bank name are required'
      });
    }

    const db = admin.firestore();
    
    // Check if username already exists
    const userSnapshot = await db.collection('bank_user')
      .where('username', '==', username)
      .get();

    if (!userSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new bank user
    const newUser = {
      username,
      password: hashedPassword,
      bank_name,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('bank_user').add(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Bank user created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Bank user registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bank user: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/bank/login:
 *   post:
 *     summary: Bank user login
 *     description: Authenticate bank user with username and password and return JWT token
 *     tags: [Bank]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Bank user's username
 *                 example: bankuser1
 *               password:
 *                 type: string
 *                 description: Bank user's password
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/bank/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const db = admin.firestore();
    
    // Find user by username
    const userSnapshot = await db.collection('bank_user')
      .where('username', '==', username)
      .get();

    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token using environment variable
    const token = jwt.sign(
      { 
        uid: userDoc.id,
        username: userData.username,
        bank_name: userData.bank_name
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        algorithm: 'HS256' // Explicitly specify the algorithm
      }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userData;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Bank login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/bank/profile:
 *   get:
 *     summary: Get bank user profile
 *     description: Get the profile of the authenticated bank user
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BankUserResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/bank/profile', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('bank_user').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const { password, ...userWithoutPassword } = userData;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile: ' + error.message
    });
  }
});

// Mount API routes
app.use('/api', router);
app.use('/api/bank', bankRouter);
app.use('/api/tarabut', tarabutRouter);
app.use('/api/user', userRouter);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Sananbil API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    showCommonExtensions: true,
    url: '/api-docs/swagger.json'
  }
}));

// Serve Swagger JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root route - must be last
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL
  });
});

// Export the Express API
module.exports = app;