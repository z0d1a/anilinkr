// backend/src/services/featuredService.js
const fetch = require('node-fetch');

/**
 * Fetches featured manga from Omegascans API.
 * We use a query with an empty search string and order by total_views (i.e. most popular).
 * The API endpoint is:
 *   https://api.omegascans.org/query?query_string=&order=desc&orderBy=total_views&series_type=Comic&page=1&perPage=10&tags_ids=[]&adult=true
 *
 * For each returned manga, we map its title, series_slug (to build a link), and thumbnail.
 *
 * @returns {Promise<Array>} An array of featured manga objects.
 */
async function getFeaturedOmegascans() {
  const BASE_API_URL = "https://api.omegascans.org";
  const url = `${BASE_API_URL}/query?query_string=&order=desc&orderBy=total_views&series_type=Comic&page=1&perPage=10&tags_ids=[]&adult=true`;
  console.log(`[Featured] Fetching featured manga from API: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      console.log(`[Featured] Failed to fetch featured manga: ${response.status}`);
      return [];
    }
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      console.log("[Featured] No featured manga data found.");
      return [];
    }
    // Map each manga to an object containing title, link, and cover.
    const featured = data.data.map(manga => ({
      title: manga.title,
      link: `https://omegascans.org/series/${manga.series_slug}`,
      cover: manga.thumbnail
    }));
    console.log(`[Featured] Found ${featured.length} featured manga.`);
    return featured;
  } catch (error) {
    console.error("Error fetching featured manga:", error);
    return [];
  }
}

module.exports = { getFeaturedOmegascans };
