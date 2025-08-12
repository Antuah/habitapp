const pool = require('../db/pool');

async function getHabits(userId) {
  const [rows] = await pool.query('SELECT id, name, goal_type, daily_goal, created_at FROM habits WHERE user_id = ? ORDER BY id DESC', [userId]);
  return rows;
}

async function findHabitByName(userId, name) {
  const [rows] = await pool.query('SELECT * FROM habits WHERE user_id = ? AND LOWER(name) = LOWER(?) LIMIT 1', [userId, name]);
  return rows[0] || null;
}

async function createHabit(userId, { name, goal_type, daily_goal = null }) {
  const [result] = await pool.query(
    'INSERT INTO habits (user_id, name, goal_type, daily_goal) VALUES (?, ?, ?, ?)',
    [userId, name, goal_type, daily_goal]
  );
  return { id: result.insertId, user_id: userId, name, goal_type, daily_goal };
}

async function deleteHabitById(habitId) {
  const [result] = await pool.query('DELETE FROM habits WHERE id = ?', [habitId]);
  return result.affectedRows > 0;
}

async function logHabit(habitId, logDate, amount = 1) {
  await pool.query(
    `INSERT INTO habit_logs (habit_id, log_date, amount) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)`,
    [habitId, logDate, amount]
  );
  return true;
}

async function summary(userId, from, to) {
  const [rows] = await pool.query(
    `SELECT h.id as habit_id, h.name, h.goal_type, h.daily_goal,
            COALESCE(SUM(CASE WHEN l.log_date BETWEEN ? AND ? THEN l.amount END), 0) as total
     FROM habits h
     LEFT JOIN habit_logs l ON l.habit_id = h.id
     WHERE h.user_id = ?
     GROUP BY h.id
     ORDER BY h.name ASC`,
    [from, to, userId]
  );
  return rows;
}

// ESTA ES LA ÚNICA Y CORRECTA VERSIÓN DE LA FUNCIÓN
async function getLogsByDate(userId, from, to) {
  const [rows] = await pool.query(
    `SELECT DISTINCT DATE_FORMAT(l.log_date, '%Y-%m-%d') as date 
     FROM habit_logs l
     JOIN habits h ON h.id = l.habit_id
     WHERE h.user_id = ? AND l.log_date BETWEEN ? AND ?`,
    [userId, from, to]
  );
  return rows.map(r => r.date);
}

async function getLogForDate(userId, date) {
  const [rows] = await pool.query(
    `SELECT h.name, h.daily_goal, l.amount 
     FROM habits h
     LEFT JOIN habit_logs l ON h.id = l.habit_id AND DATE(l.log_date) = ?
     WHERE h.user_id = ?`,
    [date, userId]
  );
  return rows;
}

// No olvides añadirlo al final en el module.exports
module.exports = {
  // ... (todas las funciones existentes)
  getLogForDate,
};


// ESTE ES EL ÚNICO Y CORRECTO EXPORT, INCLUYENDO TODAS LAS FUNCIONES
module.exports = {
  getHabits,
  findHabitByName,
  createHabit,
  deleteHabitById,
  logHabit,
  summary,
  getLogForDate,
  getLogsByDate, // <-- ¡AHORA SÍ ESTÁ INCLUIDA!
};