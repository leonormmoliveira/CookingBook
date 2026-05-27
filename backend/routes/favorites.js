const express = require('express');
const router = express.Router();

// GET /api/favorites
router.get('/', (req, res) => {
  res.json({ message: 'Get favorite recipes' });
});

// POST /api/favorites/:recipeId
router.post('/:recipeId', (req, res) => {
  res.json({ message: `Add recipe ${req.params.recipeId} to favorites` });
});

// DELETE /api/favorites/:recipeId
router.delete('/:recipeId', (req, res) => {
  res.json({ message: `Remove recipe ${req.params.recipeId} from favorites` });
});

module.exports = router;
