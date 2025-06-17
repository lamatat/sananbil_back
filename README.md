# Sananbil Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_DATABASE_URL=your-database-url

# JWT Secret
# Generate a secure JWT secret using:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-generated-jwt-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

3. Get Firebase credentials:
   - Go to Firebase Console
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Use the values from the downloaded JSON file to fill in your `.env` file

4. Generate a secure JWT secret:
   ```bash
   # Run this command to generate a secure random key
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   - Copy the generated key and add it to your `.env` file as JWT_SECRET
   - Make sure to use the same key in your Vercel environment variables

5. Get OpenAI API key:
   - Go to OpenAI Platform (https://platform.openai.com)
   - Sign in or create an account
   - Go to API Keys section
   - Create a new secret key
   - Copy the key and add it to your `.env` file

6. Start the server:
```bash
node index.js
```

## Environment Variables

- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: The client email from your Firebase service account
- `FIREBASE_PRIVATE_KEY`: The private key from your Firebase service account (include the entire key with newlines)
- `FIREBASE_DATABASE_URL`: Your Firebase database URL
- `JWT_SECRET`: A cryptographically secure random key for JWT token generation (64 bytes hex)
- `OPENAI_API_KEY`: Your OpenAI API key for LLM-based credit scoring

## API Documentation

API documentation is available at `/api-docs` when the server is running. 