const express = require('express');
const router = express.Router();

// GET /api/sharing/:recipeId
router.get('/:recipeId', (req, res) => {
  res.json({ message: `Get sharing link for recipe ${req.params.recipeId}` });
});

// POST /api/sharing/:recipeId
router.post('/:recipeId', (req, res) => {
  res.json({ message: `Share recipe ${req.params.recipeId}` });
});

module.exports = router;
