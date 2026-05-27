const express = require('express');
const router = express.Router();

// GET /api/recipes
router.get('/', (req, res) => {
  res.json({ message: 'Get all recipes' });
});

// POST /api/recipes
router.post('/', (req, res) => {
  res.json({ message: 'Create recipe' });
});

// GET /api/recipes/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get recipe ${req.params.id}` });
});

// PUT /api/recipes/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Update recipe ${req.params.id}` });
});

// DELETE /api/recipes/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete recipe ${req.params.id}` });
});

module.exports = router;
