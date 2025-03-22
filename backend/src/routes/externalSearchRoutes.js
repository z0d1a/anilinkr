// backend/src/routes/externalSearchRoutes.js
const express = require('express');
const router = express.Router();
const { searchTitle } = require('../controllers/externalSearchByTitle');

// New endpoint: GET /api/search/title?title=...
router.get('/title', searchTitle);

module.exports = router;
