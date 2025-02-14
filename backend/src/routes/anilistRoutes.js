// backend/src/routes/anilistRoutes.js
const express = require('express');
const router = express.Router();
const anilistController = require('../controllers/anilistController');

// Define route to get manga list
router.get('/manga', anilistController.fetchMangaList);

module.exports = router;
