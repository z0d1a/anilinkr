const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * GET /api/featured/asurascans
 * Query param: ?page=1 (default = 1)
 * 
 * Returns JSON:
 * {
 *   "success": true,
 *   "data": [ ...array of items... ],
 *   "hasMore": true/false
 * }
 */
async function getFeaturedAsurascansController(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const url = `https://asuracomic.net/series?page=${page}`;

    // 1) Fetch the HTML from AsuraScans
    const response = await fetch(url, {
      headers: {
        // A more “real” user-agent helps reduce chances of being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `AsuraScans responded with status ${response.status}`,
      });
    }

    const html = await response.text();

    // 2) Load into cheerio
    const $ = cheerio.load(html);

    // 3) Parse out the series items
    const items = [];
    // Example: the series page has a container with a grid of <a> or <div> items
    // Adjust selectors as needed to match Asura’s HTML structure

    // On asuracomic.net/series, the Rust snippet suggests we look for:
    // <div class="grid ..."> or <div class="flex ...">, then child <a> for each series
    // Here is a guess: each series might be <div class="series-card"> or similar
    // We'll follow the structure from your screenshot / your Rust code references.

    $('div.flex > a[href^="/series/"]').each((i, el) => {
      const anchor = $(el);
      const rawUrl = anchor.attr('href') || '';
      const coverImg = anchor.find('img').attr('src') || '';
      const titleEl = anchor.find('div.block > span.block'); // adjust as needed
      let titleText = titleEl.text().trim();
      if (!titleText) {
        // fallback if the above selector doesn’t match
        titleText = anchor.text().trim();
      }

      // Full cover URL (if needed):
      const coverUrl = coverImg.startsWith('http')
        ? coverImg
        : `https://asuracomic.net${coverImg}`;

      // The link to the series page on Asura:
      const seriesUrl = rawUrl.startsWith('http')
        ? rawUrl
        : `https://asuracomic.net${rawUrl}`;

      items.push({
        title: titleText,
        thumbnail: coverUrl,
        seriesUrl,
      });
    });

    // 4) Check if there's a "Next" button to know if there's more pages
    // Typically a link or button with text "Next" or something similar
    const nextBtn = $('a.flex.bg-themecolor:contains("Next"), a.flex.bg-themecolor:contains("next")');
    const hasMore = nextBtn.length > 0;

    // 5) Return JSON
    return res.json({
      success: true,
      data: items,
      hasMore,
    });
  } catch (err) {
    console.error('getFeaturedAsurascansController error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  }
}

module.exports = {
  getFeaturedAsurascansController,
};
