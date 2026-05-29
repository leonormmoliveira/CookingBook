const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const generateInviteToken = require('../utils/generateInviteToken');
const verifyInviteToken = require('../utils/verifyInviteToken');

router.post('/:recipeId', async (req, res) => {
  const recipeId = Number(req.params.recipeId);
  const userId = Number(req.body.userId);

  if (!recipeId || !userId) {
    return res.status(400).json({ success: false, message: 'recipeId e userId são obrigatórios.' });
  }

  try {
    const [rows] = await pool.query('SELECT id, title FROM recipes WHERE id = ? AND user_id = ?', [recipeId, userId]);
    if (rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Receita não encontrada ou não pertence a este usuário.' });
    }

    const tokenPayload = {
      type: 'recipe_share',
      recipeId,
      ownerId: userId,
    };
    const token = generateInviteToken(tokenPayload);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${frontendUrl}/share?token=${encodeURIComponent(token)}`;

    return res.json({ success: true, shareUrl, token });
  } catch (err) {
    console.error('sharing.create error:', err);
    return res.status(500).json({ success: false, message: 'Erro ao gerar link de compartilhamento.' });
  }
});

router.get('/validate', async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token ausente.' });
  }

  try {
    const payload = verifyInviteToken(token);
    if (payload.type !== 'recipe_share') {
      return res.status(400).json({ success: false, message: 'Token inválido para compartilhamento.' });
    }

    const [rows] = await pool.query(
      'SELECT id, title, description, image_url, video_url, prep_time, cook_time, servings, difficulty FROM recipes WHERE id = ?',
      [payload.recipeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receita compartilhada não encontrada.' });
    }

    return res.json({ success: true, recipe: rows[0], payload });
  } catch (err) {
    console.error('sharing.validate error:', err);
    return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
  }
});

router.get('/recipe', async (req, res) => {
  const token = req.query.token;
  const userId = Number(req.query.userId) || null;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token ausente.' });
  }

  try {
    const payload = verifyInviteToken(token);
    if (payload.type !== 'recipe_share') {
      return res.status(400).json({ success: false, message: 'Token inválido para compartilhamento.' });
    }

    const queryParams = [];
    let favoriteJoin = '';
    if (userId) {
      favoriteJoin = 'LEFT JOIN favorites f ON f.recipe_id = r.id AND f.user_id = ?';
      queryParams.push(userId);
    }
    queryParams.push(payload.recipeId);

    const selectColumns = [
      'r.id',
      'r.title',
      'r.description',
      'r.ingredients',
      'r.instructions',
      'r.image_url',
      'r.video_url',
      'r.prep_time',
      'r.cook_time',
      'r.servings',
      'r.difficulty',
      'r.user_id AS ownerId',
      'c.id AS categoryId',
      'c.name AS categoryName',
      userId ? 'CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS isFavorite' : '0 AS isFavorite',
    ].filter(Boolean).join(', ');

    const [rows] = await pool.query(
      `SELECT ${selectColumns}
        FROM recipes r
        LEFT JOIN categories c ON r.category_id = c.id
        ${favoriteJoin}
        WHERE r.id = ?`,
      queryParams
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receita compartilhada não encontrada.' });
    }

    return res.json({ success: true, recipe: rows[0] });
  } catch (err) {
    console.error('sharing.recipe error:', err);
    return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
  }
});

module.exports = router;
