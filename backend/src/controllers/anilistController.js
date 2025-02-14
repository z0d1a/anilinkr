// backend/src/controllers/anilistController.js
const anilistService = require('../services/anilistService');

async function fetchMangaList(req, res) {
  try {
    const mangaList = await anilistService.getMangaList();
    res.json(mangaList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga list' });
  }
}

module.exports = {
  fetchMangaList
};
