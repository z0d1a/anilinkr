const express = require('express');
const router = express.Router();
const { getFeaturedAsurascansController } = require('../controllers/featuredAsurascansController');

router.get('/asurascans', getFeaturedAsurascansController);

module.exports = router;
