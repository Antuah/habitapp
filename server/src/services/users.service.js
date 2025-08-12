const pool = require('../db/pool');

async function ensureUser(alexaUserId, displayName = null) {
  const [rows] = await pool.query('SELECT * FROM users WHERE alexa_user_id = ? LIMIT 1', [alexaUserId]);
  if (rows.length) return rows[0];
  const [result] = await pool.query(
    'INSERT INTO users (alexa_user_id, display_name) VALUES (?, ?)',
    [alexaUserId, displayName]
  );
  return { id: result.insertId, alexa_user_id: alexaUserId, display_name: displayName };
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getByAlexaId(alexaUserId) {
  const [rows] = await pool.query('SELECT * FROM users WHERE alexa_user_id = ? LIMIT 1', [alexaUserId]);
  return rows[0] || null;
}

module.exports = { ensureUser, getById, getByAlexaId };