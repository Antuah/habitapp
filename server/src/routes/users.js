const express = require('express');
const router = express.Router();
const Users = require('../services/users.service');

router.post('/', async (req, res) => {
  try {
    const { alexa_user_id, display_name } = req.body || {};
    if (!alexa_user_id) return res.status(400).json({ error: 'alexa_user_id requerido' });
    const user = await Users.ensureUser(alexa_user_id, display_name || null);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

router.get('/:id/streak', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Users.calculateStreak(Number(id));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error calculando la racha' });
  }
});

module.exports = router;