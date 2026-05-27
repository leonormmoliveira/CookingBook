const express = require('express');
const RecipeController = require('../controllers/RecipeController');
const router = express.Router();

// GET /api/recipes?userId=123
router.get('/', RecipeController.getRecipes);

// POST /api/recipes
router.post('/', RecipeController.createRecipe);

module.exports = router;
