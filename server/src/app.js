require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const health = require('./routes/health');
const alexa = require('./routes/alexa');
const habits = require('./routes/habits');
const users = require('./routes/users');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true }));
app.use('/health', health);
app.use('/alexa', alexa);              // POST /alexa (endpoint de la Skill)
app.use('/api/habits', habits);
app.use('/api/users', users);

module.exports = app;
