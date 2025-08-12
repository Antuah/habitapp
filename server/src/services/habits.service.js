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

async function deleteHabit(userId, name) {
  const [result] = await pool.query('DELETE FROM habits WHERE user_id = ? AND LOWER(name) = LOWER(?)', [userId, name]);
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

async function deleteHabitById(habitId) {
  const [result] = await pool.query('DELETE FROM habits WHERE id = ?', [habitId]);
  return result.affectedRows > 0;
}
module.exports = {
  getHabits, findHabitByName, createHabit, deleteHabit, logHabit, summary,
  deleteHabitById, // ← exporta
};

module.exports = { getHabits, findHabitByName, createHabit, deleteHabit, logHabit, summary, deleteHabitById };
