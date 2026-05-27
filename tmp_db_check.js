const mysql = require('mysql2/promise');
(async () => {
  try {
    const pool = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cookingbook',
      port: 3306,
    });
    const [rows] = await pool.query('SHOW COLUMNS FROM recipes');
    console.log(JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (err) {
    console.error('DB check failed', err.message);
  }
})();
