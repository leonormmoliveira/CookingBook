const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/RecipeController');

// POST /api/video-analysis
router.post('/', RecipeController.analyzeVideo);

router.get("/image-suggestions", RecipeController.getRecipeImageSuggestions);

module.exports = router;
