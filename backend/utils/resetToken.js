const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

function generateResetToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function verifyResetToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateResetToken, verifyResetToken };