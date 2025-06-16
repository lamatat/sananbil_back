const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'YOUR_PROJECT_ID',
    clientEmail: 'YOUR_CLIENT_EMAIL',
    privateKey: 'YOUR_PRIVATE_KEY'
  }),
  databaseURL: 'YOUR_DATABASE_URL'
});

module.exports = admin; 