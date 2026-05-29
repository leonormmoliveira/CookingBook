const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/RecipeController');
const VideoAnalysisController = require('../controllers/VideoAnalysisController');

router.post("/extract-video", VideoAnalysisController.extrairVideo);

router.get("/image-suggestions", RecipeController.getRecipeImageSuggestions);

module.exports = router;