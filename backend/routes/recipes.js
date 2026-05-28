const express = require('express');
const { upload } = require('../middleware/upload');
const RecipeController = require('../controllers/RecipeController');
const router = express.Router();

// GET /api/recipes?userId=123
router.get('/', RecipeController.getRecipes);

// GET /api/recipes/:id
router.get('/:id', RecipeController.getRecipeById);

// POST /api/recipes
router.post('/', upload.single('image'), RecipeController.createRecipe);

// PUT /api/recipes/:id
router.put('/:id', upload.single('image'), RecipeController.updateRecipe);

// DELETE /api/recipes/:id
router.delete('/:id', RecipeController.deleteRecipe);

module.exports = router;
