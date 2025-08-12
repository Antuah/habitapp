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

async function calculateStreak(userId) {
  // 1. Obtenemos todas las fechas únicas en las que el usuario registró algo.
  const [rows] = await pool.query(
    `SELECT DISTINCT DATE(log_date) as date 
     FROM habit_logs l
     JOIN habits h ON h.id = l.habit_id
     WHERE h.user_id = ? ORDER BY date DESC`,
    [userId]
  );

  if (rows.length === 0) {
    return { streak: 0 };
  }

  // 2. Calculamos la racha en JavaScript
  let streak = 0;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Convertimos las fechas de la BD a strings 'YYYY-MM-DD' para comparar fácil
  const logDates = rows.map(r => r.date.toISOString().split('T')[0]);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let lastDate = today;

  // Si el último log no es de hoy ni de ayer, la racha es 0.
  if (logDates[0] !== todayStr && logDates[0] !== yesterdayStr) {
    return { streak: 0 };
  }

  // Si hay un log hoy o ayer, la racha es al menos 1.
  streak = 1;
  lastDate = new Date(logDates[0]);

  // Recorremos el resto de los días para ver si son consecutivos
  for (let i = 1; i < logDates.length; i++) {
    const currentDate = new Date(logDates[i]);
    const expectedPreviousDate = new Date(lastDate);
    expectedPreviousDate.setDate(lastDate.getDate() - 1);

    if (currentDate.toISOString().split('T')[0] === expectedPreviousDate.toISOString().split('T')[0]) {
      streak++;
      lastDate = currentDate;
    } else {
      // Si hay un hueco en las fechas, la racha se rompe.
      break;
    }
  }

  return { streak };
}

module.exports = { ensureUser, getById, getByAlexaId, calculateStreak };