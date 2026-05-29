const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account.json');

const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: privateKey,
    })
});

console.log('Firebase Admin SDK initialized successfully with project:', serviceAccount.project_id);

module.exports = admin;