const pool = require('../config/database');

const FavoriteController = {
  getFavorites: async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId é obrigatório.' });
    }

    try {
      const [rows] = await pool.query(
        `SELECT
          f.recipe_id AS recipeId,
          r.id,
          r.title,
          r.description,
          r.ingredients,
          r.instructions,
          r.image_url,
          r.video_url,
          r.prep_time,
          r.cook_time,
          r.servings,
          r.difficulty,
          r.created_at,
          c.id AS categoryId,
          c.name AS categoryName,
          c.description AS categoryDescription
        FROM favorites f
        JOIN recipes r ON f.recipe_id = r.id
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC`,
        [userId]
      );

      return res.json({ success: true, favorites: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar favoritos.' });
    }
  },

  addFavorite: async (req, res) => {
    const { userId, recipeId } = req.body;
    const parsedUserId = Number(userId);
    const parsedRecipeId = Number(recipeId);

    if (!parsedUserId || !parsedRecipeId) {
      return res.status(400).json({ success: false, message: 'userId e recipeId são obrigatórios.' });
    }

    try {
      const [recipeRows] = await pool.query('SELECT id FROM recipes WHERE id = ? AND user_id = ?', [parsedRecipeId, parsedUserId]);
      if (recipeRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Receita não encontrada para este usuário.' });
      }

      const [existing] = await pool.query('SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?', [parsedUserId, parsedRecipeId]);
      if (existing.length > 0) {
        return res.json({ success: true, message: 'Receita já está nos favoritos.' });
      }

      await pool.query('INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)', [parsedUserId, parsedRecipeId]);
      return res.status(201).json({ success: true, message: 'Receita adicionada aos favoritos.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao adicionar favorito.' });
    }
  },

  removeFavorite: async (req, res) => {
    const recipeId = Number(req.params.recipeId);
    const userId = Number(req.query.userId || req.body.userId);

    if (!userId || !recipeId) {
      return res.status(400).json({ success: false, message: 'userId e recipeId são obrigatórios.' });
    }

    try {
      const [result] = await pool.query('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Favorito não encontrado.' });
      }
      return res.json({ success: true, message: 'Receita removida dos favoritos.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao remover favorito.' });
    }
  },

  checkFavorite: async (req, res) => {
    const recipeId = Number(req.params.recipeId);
    const userId = Number(req.query.userId);

    if (!userId || !recipeId) {
      return res.status(400).json({ success: false, message: 'userId e recipeId são obrigatórios.' });
    }

    try {
      const [rows] = await pool.query('SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
      return res.json({ success: true, isFavorite: rows.length > 0 });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao verificar favorito.' });
    }
  },
};

module.exports = FavoriteController;
