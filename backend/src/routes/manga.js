// backend/src/routes/manga.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../services/authService');

// Dummy endpoint to update progress for a manga (you'd normally update your DB)
router.post('/:id/progress', authenticateToken, async (req, res) => {
  const mangaId = req.params.id;
  const { progress } = req.body;
  // Update the user's progress in your database (placeholder):
  console.log(`User ${req.user.username} updated progress for manga ${mangaId} to ${progress}`);
  res.json({ message: 'Progress updated', mangaId, progress });
});

module.exports = router;
