const express = require('express');
const router = express.Router();
const Habits = require('../services/habits.service');

// Nota: para demo pasamos user_id por query/body (o monta un middleware de auth simple)

router.get('/', async (req, res) => {
  try {
    const userId = Number(req.query.user_id || req.body.user_id);
    if (!userId) return res.status(400).json({ error: 'user_id requerido' });
    const rows = await Habits.getHabits(userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error listando hábitos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, name, goal_type, daily_goal } = req.body || {};
    if (!user_id || !name || !goal_type) return res.status(400).json({ error: 'user_id, name, goal_type requeridos' });
    const created = await Habits.createHabit(Number(user_id), { name, goal_type, daily_goal: daily_goal ?? null });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando hábito' });
  }
});

router.post('/:id/logs', async (req, res) => {
  try {
    const habitId = Number(req.params.id);
    const { date, amount } = req.body || {};
    if (!habitId) return res.status(400).json({ error: 'habit id inválido' });
    const logDate = date || new Date().toISOString().slice(0, 10);
    await Habits.logHabit(habitId, logDate, Number(amount || 1));
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registrando hábito' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    const from = req.query.from;
    const to = req.query.to;
    if (!userId || !from || !to) return res.status(400).json({ error: 'user_id, from, to requeridos' });
    const rows = await Habits.summary(userId, from, to);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en summary' });
  }
});

module.exports = router;