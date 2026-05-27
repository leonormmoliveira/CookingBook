const express = require('express');
const RecipeController = require('../controllers/RecipeController');
const router = express.Router();

// GET /api/categories?userId=123
router.get('/', RecipeController.getCategories);

// POST /api/categories
router.post('/', RecipeController.createCategory);

module.exports = router;
