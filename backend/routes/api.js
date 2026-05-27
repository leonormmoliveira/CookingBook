const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/RecipeController');

router.get('/categories', RecipeController.getCategories);
router.post('/categories', RecipeController.createCategory);
router.get('/recipes', RecipeController.getRecipes);
router.post('/recipes', RecipeController.createRecipe);
router.post('/video-analysis', RecipeController.analyzeVideo);

module.exports = router;