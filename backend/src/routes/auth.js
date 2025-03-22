// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser } = require('../services/authService');

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await registerUser(username, password);
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const token = await authenticateUser(username, password);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
