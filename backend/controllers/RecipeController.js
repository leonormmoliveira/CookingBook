const pool = require('../config/database');
const { uploadToCloudinary } = require('../middleware/upload');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

async function findOrCreateCategory(userId, name) {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error('Nome da categoria inválido.');
  }

  const [rows] = await pool.query(
    'SELECT id FROM categories WHERE user_id = ? AND name = ?',
    [userId, normalized]
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name) VALUES (?, ?)',
      [userId, normalized]
    );

    return result.insertId;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const [existing] = await pool.query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ?',
        [userId, normalized]
      );
      return existing[0]?.id;
    }
    throw err;
  }
}

async function hasColumn(table, column) {
  const schema = process.env.DB_NAME || 'cookingbook';
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [schema, table, column]
  );
  return rows[0]?.count > 0;
}

async function isColumnNullable(table, column) {
  const schema = process.env.DB_NAME || 'cookingbook';
  const [rows] = await pool.query(
    'SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [schema, table, column]
  );
  return rows[0]?.IS_NULLABLE === 'YES';
}

function extractJsonFromText(text) {
  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  const candidate = trimmed.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (err) {
    return null;
  }
}

async function callOpenAI(messages) {
  try {
    const response = await axios.post(
      OPENAI_ENDPOINT,
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 600,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: 20000,
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    const status = err.response?.status;
    const info = err.response?.data?.error?.message || err.response?.data || err.message;
    throw new Error(`OpenAI request failed${status ? ` (${status})` : ''}: ${info}`);
  }
}

async function fetchOpenAIRecipe(videoUrl) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurado no backend.');
  }

  const basePrompt = `You are a cooking assistant. Given the video URL ${videoUrl}, extract a recipe with the following JSON format only: {"title":"...","description":"...","category":"...","ingredients":["..."],"instructions":["..."],"servings":"...","difficulty":"Fácil|Médio|Difícil"}. Return valid JSON only and nothing else.`;

  const firstContent = await callOpenAI([
    { role: 'system', content: 'You are a helpful recipe assistant.' },
    { role: 'user', content: basePrompt },
  ]);

  let parsed = extractJsonFromText(firstContent || '');
  if (parsed) {
    return { parsed, raw: firstContent };
  }

  const retryPrompt = `The previous response did not contain parseable JSON. Here is the original text: ${firstContent || '[empty response]'}\nPlease return only a valid JSON object with the same keys: title, description, category, ingredients, instructions, servings, difficulty.`;
  const secondContent = await callOpenAI([
    { role: 'system', content: 'You are a helpful recipe assistant.' },
    { role: 'user', content: retryPrompt },
  ]);

  parsed = extractJsonFromText(secondContent || '');
  return { parsed: parsed || null, raw: secondContent || firstContent || '' };
}

const RecipeController = {
  getCategories: async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId é obrigatório.' });
    }

    try {
      const [rows] = await pool.query(
        'SELECT id, name, description, color FROM categories WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return res.json({ success: true, categories: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar categorias.' });
    }
  },

  createCategory: async (req, res) => {
    const { userId, name, description, color } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ success: false, message: 'userId e nome são obrigatórios.' });
    }

    try {
      const [existing] = await pool.query('SELECT id, name, description, color FROM categories WHERE user_id = ? AND name = ?', [userId, name.trim()]);
      if (existing.length > 0) {
        return res.json({ success: true, category: existing[0], message: 'Categoria já existe.' });
      }

      const [result] = await pool.query(
        'INSERT INTO categories (user_id, name, description, color) VALUES (?, ?, ?, ?)',
        [userId, name.trim(), description || null, color || null]
      );

      const [newCategory] = await pool.query('SELECT id, name, description, color FROM categories WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, category: newCategory[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao criar categoria.' });
    }
  },

  createRecipe: async (req, res) => {
    const file = req.file;
    const { userId, title, description, categoryName, ingredients, instructions, videoUrl, imageUrl, prepTime, cookTime, servings, difficulty } = req.body;

    if (!userId || !title || !ingredients || !instructions) {
      return res.status(400).json({ success: false, message: 'userId, título, ingredientes e instruções são obrigatórios.' });
    }

    try {
      let categoryId = null;
      if (categoryName) {
        categoryId = await findOrCreateCategory(userId, categoryName);
      } else {
        const categoryNullAllowed = await isColumnNullable('recipes', 'category_id');
        if (!categoryNullAllowed) {
          categoryId = await findOrCreateCategory(userId, 'Sem categoria');
        }
      }

      let finalImageUrl = imageUrl || null;
      if (file && file.buffer) {
        const uploadResult = await uploadToCloudinary(file.buffer, 'recipes');
        finalImageUrl = uploadResult.url;
      }

      const imageDataColumnExists = await hasColumn('recipes', 'image_data');
      const insertFields = [
        'user_id',
        'category_id',
        'title',
        'description',
        'ingredients',
        'instructions',
        'image_url',
        'video_url',
        'prep_time',
        'cook_time',
        'servings',
        'difficulty',
      ];
      const insertValues = [
        userId,
        categoryId,
        title.trim(),
        description?.trim() || null,
        ingredients.trim(),
        instructions.trim(),
        finalImageUrl,
        videoUrl || null,
        prepTime ? Number(prepTime) : null,
        cookTime ? Number(cookTime) : null,
        servings ? Number(servings) : null,
        difficulty || null,
      ];

      if (imageDataColumnExists) {
        insertFields.splice(7, 0, 'image_data');
        insertValues.splice(7, 0, null);
      }

      const placeholders = insertFields.map(() => '?').join(', ');
      const sql = `INSERT INTO recipes (${insertFields.join(', ')}) VALUES (${placeholders})`;
      const [result] = await pool.query(sql, insertValues);

      return res.status(201).json({ success: true, recipeId: result.insertId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message || 'Erro ao criar receita.' });
    }
  },

  getRecipes: async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId é obrigatório.' });
    }

    try {
      const imageDataColumnExists = await hasColumn('recipes', 'image_data');
      const selectColumns = [
        'r.id',
        'r.title',
        'r.description',
        'r.ingredients',
        'r.instructions',
        'r.image_url',
        imageDataColumnExists ? 'r.image_data' : null,
        'r.video_url',
        'r.prep_time',
        'r.cook_time',
        'r.servings',
        'r.difficulty',
        'r.created_at',
        'c.id AS categoryId',
        'c.name AS categoryName',
      ].filter(Boolean).join(', ');

      const [rows] = await pool.query(
        `SELECT ${selectColumns}
          FROM recipes r
          LEFT JOIN categories c ON r.category_id = c.id
          WHERE r.user_id = ?
          ORDER BY CASE WHEN c.name IS NULL THEN 1 ELSE 0 END, c.name, r.created_at DESC`,
        [userId]
      );
      return res.json({ success: true, recipes: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar receitas.' });
    }
  },

  analyzeVideo: async (req, res) => {
    const { userId, videoUrl } = req.body;
    if (!userId || !videoUrl) {
      return res.status(400).json({ success: false, message: 'userId e videoUrl são obrigatórios.' });
    }

    try {
      const result = await fetchOpenAIRecipe(videoUrl.trim());
      const analysisResult = JSON.stringify(result);
      await pool.query('INSERT INTO video_analysis (user_id, video_url, analysis_result) VALUES (?, ?, ?)', [userId, videoUrl.trim(), analysisResult]);

      if (!result.parsed && !result.raw?.trim()) {
        return res.status(500).json({ success: false, message: 'OpenAI não retornou um resultado de receita válido. Tente novamente.' });
      }

      return res.json({ success: true, result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message || 'Erro na análise de vídeo.' });
    }
  },
};

module.exports = RecipeController;