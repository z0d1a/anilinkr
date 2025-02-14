// backend/src/controllers/externalSearchController.js
const anilistService = require('../services/anilistService');
const externalSearchService = require('../services/externalSearchService');

/**
 * Normalizes punctuation in a string by replacing common typographic quotes/apostrophes
 * with their plain ASCII equivalents.
 * @param {string} text - The text to normalize.
 * @returns {string}
 */
function normalizePunctuation(text) {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"');
}

/**
 * Returns true if the given text contains only ASCII characters.
 * @param {string} text - The text to test.
 * @returns {boolean}
 */
function isEnglish(text) {
  const normalized = normalizePunctuation(text);
  return /^[\x00-\x7F]+$/.test(normalized);
}

/**
 * Searches for external manga links using candidate titles from AniList.
 * Candidate titles are built as follows:
 *  - If the English title exists and is different from the display title, add it first.
 *  - Then add the display title (userPreferred).
 *  - Then add the native title.
 *  - Then add synonyms only if they are in English.
 * Duplicate titles are removed.
 *
 * Also, the controller determines if the manga is adult content by checking media.isAdult.
 * For adult manga, only Omegascans and Toongod are used.
 * For non-adult manga, only Comick is used.
 *
 * @param {Object} req - Express request (expects req.params.id to be the AniList manga media ID).
 * @param {Object} res - Express response.
 */
async function searchMangaExternal(req, res) {
  try {
    const mangaId = req.params.id;
    const mangaList = await anilistService.getMangaList();
    let manga = null;
    for (const list of mangaList.lists) {
      manga = list.entries.find(entry => entry.media.id.toString() === mangaId);
      if (manga) break;
    }
    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }
    
    const candidateTitles = [];
    // If the English title exists and is different from userPreferred, add it first.
    if (manga.media.title.english &&
        manga.media.title.english !== manga.media.title.userPreferred &&
        isEnglish(manga.media.title.english)) {
      candidateTitles.push(manga.media.title.english);
    }
    // Always include the display title.
    if (manga.media.title.userPreferred) {
      candidateTitles.push(manga.media.title.userPreferred);
    }
    // Always include the native title.
    if (manga.media.title.native) {
      candidateTitles.push(manga.media.title.native);
    }
    // Include only English synonyms.
    if (manga.media.synonyms && manga.media.synonyms.length) {
      const englishSynonyms = manga.media.synonyms.filter(isEnglish);
      candidateTitles.push(...englishSynonyms);
    }
    
    // Remove duplicates and falsey values.
    const uniqueTitles = Array.from(new Set(candidateTitles.filter(Boolean)));
    console.log("Candidate titles to search:", uniqueTitles);
    
    // Determine if the manga is adult:
    // For our purposes, we consider it adult if media.isAdult is true.
    const isAdult = manga.media.isAdult === true;
    console.log(`Manga (ID: ${mangaId}) adult status: ${isAdult}`);
    
    const result = await externalSearchService.searchExternal(uniqueTitles, isAdult);
    if (!result) {
      return res.status(404).json({ error: 'External link not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error in searchMangaExternal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  searchMangaExternal
};
