// backend/src/controllers/featuredController.js
const fetch = require('node-fetch');

async function getFeaturedOmegascansController(req, res) {
  try {
    // Build the API URL. Adjust perPage if needed.
    const apiUrl = 'https://api.omegascans.org/query?order=desc&orderBy=total_views&series_type=Comic&page=1&perPage=20&adult=true';
    console.log(`Fetching featured manga from Omegascans API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' }
      });      
    console.log(`Response status from Omegascans: ${response.status}`);
    
    // Read response text for debugging
    const responseText = await response.text();
    console.log("Full response text from Omegascans:", responseText);

    if (!response.ok) {
      console.error(`Failed to fetch featured manga. Status: ${response.status}`);
      return res.status(500).json({ error: 'Failed to fetch featured manga' });
    }

    let json;
    try {
      json = JSON.parse(responseText);
      console.log("Parsed JSON successfully.");
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({ error: 'Error parsing JSON from Omegascans' });
    }

    // Log the meta information for additional context.
    console.log("Meta information from JSON:", json.meta);

    if (!json.data || !Array.isArray(json.data)) {
      console.error("Invalid JSON structure: missing or invalid 'data' field.");
      return res.status(500).json({ error: 'Invalid JSON structure from Omegascans' });
    }

    // Map each manga to the fields we want.
    const featuredManga = json.data.map(item => {
      // Remove any HTML tags from the description.
      const plainSummary = item.description ? item.description.replace(/<[^>]*>/g, '') : '';
      return {
        cover: item.thumbnail || '',
        title: item.title || '',
        // Construct the series URL using the series_slug.
        url: item.series_slug ? `https://omegascans.org/series/${item.series_slug}` : '',
        summary: plainSummary,
      };
    });

    console.log("Parsed featured manga:", featuredManga);
    return res.json({ featured: featuredManga });
  } catch (error) {
    console.error("Error in getFeaturedOmegascansController:", error);
    return res.status(500).json({ error: 'Internal server error in featured controller' });
  }
}

module.exports = { getFeaturedOmegascansController };
