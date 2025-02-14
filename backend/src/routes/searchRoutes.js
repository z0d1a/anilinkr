// backend/src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const externalSearchController = require('../controllers/externalSearchController');

// Define route to search external link for a manga by its AniList media id.
router.get('/manga/:id', externalSearchController.searchMangaExternal);

module.exports = router;
