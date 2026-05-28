const express = require('express');
const FavoriteController = require('../controllers/FavoriteController');
const router = express.Router();

// GET /api/favorites?userId=123
router.get('/', FavoriteController.getFavorites);

// GET /api/favorites/check/:recipeId?userId=123
router.get('/check/:recipeId', FavoriteController.checkFavorite);

// POST /api/favorites
router.post('/', FavoriteController.addFavorite);

// DELETE /api/favorites/:recipeId?userId=123
router.delete('/:recipeId', FavoriteController.removeFavorite);

module.exports = router;
