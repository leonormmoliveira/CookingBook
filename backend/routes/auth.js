const express = require('express');
const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.json({ message: 'User registration' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'User login' });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'User logout' });
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile' });
});

module.exports = router;
