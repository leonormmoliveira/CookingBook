const express = require('express');
const router = express.Router();

// GET /api/categories
router.get('/', (req, res) => {
  res.json({ message: 'Get all categories' });
});

// POST /api/categories
router.post('/', (req, res) => {
  res.json({ message: 'Create category' });
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Update category ${req.params.id}` });
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete category ${req.params.id}` });
});

module.exports = router;
