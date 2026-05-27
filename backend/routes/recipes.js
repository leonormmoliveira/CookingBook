const express = require('express');
const { upload } = require('../middleware/upload');
const RecipeController = require('../controllers/RecipeController');
const router = express.Router();

// GET /api/recipes?userId=123
router.get('/', RecipeController.getRecipes);

// POST /api/recipes
router.post('/', upload.single('image'), RecipeController.createRecipe);

module.exports = router;
