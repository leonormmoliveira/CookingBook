const express = require('express');
const router = express.Router();

// POST /api/video-analysis
router.post('/', (req, res) => {
  res.json({ message: 'Analyze video and generate recipe' });
});

module.exports = router;
