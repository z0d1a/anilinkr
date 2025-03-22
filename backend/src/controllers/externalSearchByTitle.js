// backend/src/controllers/externalSearchByTitle.js
const externalSearchService = require('../services/externalSearchService');

/**
 * Searches for a manga using a free-text title query.
 * For non‑adult content we use Comick’s API.
 * Expects a query parameter “title”.
 */
async function searchTitle(req, res) {
  try {
    const { title } = req.query;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title query parameter is required' });
    }
    // For non-adult titles, we use the Comick search helper.
    const link = await externalSearchService.searchComickForTitle(title);
    if (!link) {
      return res.status(404).json({ error: 'No external link found' });
    }
    res.json({ link });
  } catch (error) {
    console.error('Error in searchTitle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  searchTitle,
};
