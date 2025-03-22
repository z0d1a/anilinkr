// backend/src/services/externalSearchService.js
const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Performs a fetch request using headers that closely mimic a real browser.
 * We can also accept JSON if needed.
 * @param {string} url - The URL to fetch.
 * @param {Object} [customHeaders] - Optional additional or overriding headers.
 * @returns {Promise<Response>}
 */
async function fetchWithHeaders(url, customHeaders = {}) {
  const baseHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  };
  const headers = { ...baseHeaders, ...customHeaders };
  return await fetch(url, { headers });
}

/**
 * Normalizes a title into a URL-friendly “slug.”
 * Returns null if there are no Latin letters or digits.
 * @param {string} title - The title to normalize.
 * @returns {string|null}
 */
function normalizeTitle(title) {
  const lower = title.toLowerCase().trim();
  if (!/[a-z0-9]/.test(lower)) {
    return null;
  }
  return lower.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

/**
 * Verifies a candidate URL by performing a GET request.
 * For Omegascans: if response.ok, we assume the URL is valid.
 * For Toongod and Comick: if a 403 is returned, we assume it’s valid
 *   (these sites often block “bot-like” requests but the URL is correct).
 * Otherwise, if response is OK, we can inspect the HTML for the candidateTitle.
 *
 * @param {string} url - The candidate URL.
 * @param {string} candidateTitle - The title used to generate this URL.
 * @returns {Promise<boolean>}
 */
async function verifyLink(url, candidateTitle) {
  try {
    const response = await fetchWithHeaders(url);
    // 1) Omegascans: if response.ok => valid.
    if (url.includes("omegascans.org") && response.ok) {
      return true;
    }
    // 2) Toongod and Comick: if status 403, assume valid.
    if ((url.includes("toongod.org/webtoon") || url.includes("comick.io/comic")) && response.status === 403) {
      console.log(`verifyLink: Received 403 for "${url}". Assuming it is valid.`);
      return true;
    }
    // Otherwise, if response.ok, check HTML.
    if (response.ok) {
      const html = await response.text();
      const normCandidate = candidateTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (html.toLowerCase().includes(normCandidate)) {
        return true;
      } else {
        console.log(`verifyLink: Normalized candidate "${normCandidate}" not found in HTML from ${url}.`);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("verifyLink error:", error);
    return false;
  }
}

/* ============================================
   Omegascans Search Strategies
   ============================================ */

/**
 * Attempts to find the manga on Omegascans using a direct URL.
 */
async function searchOmegascansDirect(title) {
  const slug = normalizeTitle(title);
  if (!slug) {
    console.log(`[Omegascans] Skipping title "${title}" (cannot normalize)`);
    return null;
  }
  const url = `https://omegascans.org/series/${slug}`;
  console.log(`[Omegascans] Trying direct URL: ${url}`);
  try {
    const response = await fetchWithHeaders(url);
    if (response.ok) {
      console.log(`[Omegascans] Direct URL exists: ${url}`);
      if (await verifyLink(url, title)) return url;
    } else {
      console.log(`[Omegascans] Direct URL failed with status ${response.status}`);
    }
    return null;
  } catch (error) {
    console.error(`[Omegascans] Direct URL error for "${title}": ${error}`);
    return null;
  }
}

/**
 * Attempts to find the manga on Omegascans by scraping the search results.
 */
async function searchOmegascansScrape(title) {
  const searchUrl = `https://omegascans.org/?s=${encodeURIComponent(title)}`;
  console.log(`[Omegascans] Searching via scrape at: ${searchUrl}`);
  try {
    const response = await fetchWithHeaders(searchUrl);
    if (!response.ok) {
      console.log(`[Omegascans] Search page fetch failed: ${response.status}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const candidates = [];
    $('a[href*="/series/"]').each((i, el) => {
      const link = $(el).attr('href');
      if (link) candidates.push(link);
    });
    console.log(`[Omegascans] Candidate links found:`, candidates);
    const slug = normalizeTitle(title);
    if (!slug) return null;
    for (let link of candidates) {
      if (link.toLowerCase().includes(slug)) {
        console.log(`[Omegascans] Found matching link for "${title}": ${link}`);
        if (await verifyLink(link, title)) return link;
      }
    }
    return null;
  } catch (error) {
    console.error(`[Omegascans] Scrape error for "${title}": ${error}`);
    return null;
  }
}

/**
 * Searches Omegascans for the manga using both strategies.
 */
async function searchOmegascans(title) {
  let link = await searchOmegascansDirect(title);
  if (link) return link;
  return await searchOmegascansScrape(title);
}

/* ============================================
   Toongod Search Strategies
   ============================================ */

async function searchToongodDirect(title) {
  const slug = normalizeTitle(title);
  if (!slug) {
    console.log(`[Toongod] Skipping title "${title}" (cannot normalize)`);
    return null;
  }
  const baseUrl = "https://www.toongod.org/webtoon/";
  let url = `${baseUrl}${slug}/`;
  console.log(`[Toongod] Trying direct URL: ${url}`);
  try {
    let response = await fetchWithHeaders(url);
    if (response.ok) {
      console.log(`[Toongod] Direct URL exists: ${url}`);
      if (await verifyLink(url, title)) return url;
    } else if (response.status === 403) {
      console.log(`[Toongod] Received 403 for direct URL. Assuming URL is valid: ${url}`);
      return url;
    } else {
      if (slug.includes("disciplining")) {
        const altSlug = slug.replace("disciplining", "discipling");
        url = `${baseUrl}${altSlug}/`;
        console.log(`[Toongod] Trying alternate direct URL: ${url}`);
        response = await fetchWithHeaders(url);
        if (response.ok) {
          console.log(`[Toongod] Alternate direct URL exists: ${url}`);
          if (await verifyLink(url, title)) return url;
        } else if (response.status === 403) {
          console.log(`[Toongod] Received 403 for alternate direct URL. Assuming URL is valid: ${url}`);
          return url;
        }
      }
      console.log(`[Toongod] Direct URL failed with status ${response.status}`);
    }
    return null;
  } catch (error) {
    console.error(`[Toongod] Direct URL error for "${title}": ${error}`);
    return null;
  }
}

async function searchToongodScrape(title) {
  const searchUrl = `https://www.toongod.org/?s=${encodeURIComponent(title)}`;
  console.log(`[Toongod] Searching via scrape at: ${searchUrl}`);
  try {
    const response = await fetchWithHeaders(searchUrl);
    if (!response.ok) {
      console.log(`[Toongod] Search fetch failed: ${response.status}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const candidates = [];
    $('a[href*="/webtoon/"]').each((i, el) => {
      const link = $(el).attr('href');
      if (link) candidates.push(link);
    });
    console.log(`[Toongod] Candidate links found:`, candidates);
    const slug = normalizeTitle(title);
    if (!slug) return null;
    for (let link of candidates) {
      if (link.toLowerCase().includes(slug)) {
        console.log(`[Toongod] Found matching link for "${title}": ${link}`);
        if (await verifyLink(link, title)) return link;
      }
    }
    return null;
  } catch (error) {
    console.error(`[Toongod] Scrape error for "${title}": ${error}`);
    return null;
  }
}

async function searchToongod(title) {
  let link = await searchToongodDirect(title);
  if (link) return link;
  return await searchToongodScrape(title);
}

/* ============================================
   Comick Search Strategy (for non-adult manga)
   ============================================ */

/**
 * Fetches JSON from Comick's API using extra headers to mimic a browser.
 * @param {string} url - The API URL.
 * @returns {Promise<Response>}
 */
async function fetchComickJson(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.8",
    "Origin": "https://comick.io",
    "Referer": "https://comick.io/"
  };
  return await fetch(url, { headers });
}

/**
 * Attempts to search Comick for the manga using their API.
 * If found, returns the full comic URL (https://comick.io/comic/{slug}).
 */
async function searchComickForTitle(title) {
  // Build the API URL using the provided query parameters.
  const searchUrl = `https://api.comick.io/v1.0/search/?page=1&limit=1&showall=false&q=${encodeURIComponent(title)}&t=false`;
  console.log(`[Comick] Searching for title "${title}" using API URL: ${searchUrl}`);
  try {
    const response = await fetchComickJson(searchUrl);
    if (!response.ok) {
      console.log(`[Comick] API search failed with status ${response.status}`);
      return null;
    }
    const jsonData = await response.json();
    // The result may be an array or an object. We handle both cases.
    let slug = null;
    if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].slug) {
      slug = jsonData[0].slug;
    } else if (jsonData && jsonData.slug) {
      slug = jsonData.slug;
    }
    if (slug) {
      const finalUrl = `https://comick.io/comic/${slug}`;
      console.log(`[Comick] Found slug "${slug}" for title "${title}", final URL: ${finalUrl}`);
      if (await verifyLink(finalUrl, title)) return finalUrl;
    }
    return null;
  } catch (error) {
    console.error(`[Comick] Error searching for "${title}":`, error);
    return null;
  }
}

/* ============================================
   Combined External Search Across Websites
   ============================================ */

/**
 * Iterates over an array of candidate titles and tries external search functions.
 * - For adult manga, only Omegascans & Toongod are used.
 * - For non-adult manga, only Comick is used.
 *
 * Returns an object with website keys and an array of unique links for each,
 * or null if nothing found.
 *
 * @param {string[]} titles - Candidate titles.
 * @param {boolean} isAdult - If true, search Omegascans & Toongod; else, use Comick.
 * @returns {Promise<Object|null>}
 */
async function searchExternal(titles, isAdult) {
  let websites;
  if (isAdult) {
    websites = [
      { name: 'Omegascans', searchFunc: searchOmegascans },
      { name: 'Toongod', searchFunc: searchToongod }
    ];
  } else {
    // For non-adult content, we only check Comick.
    websites = [
      { name: 'Comick', searchFunc: async (title) => await searchComickForTitle(title) }
    ];
  }

  // Use an object with Set values for uniqueness.
  const results = {};
  for (const site of websites) {
    results[site.name] = new Set();
  }

  if (!isAdult) {
    // For non-adult content, use only the first candidate title.
    const title = titles[0];
    console.log(`Non-adult content: using only first candidate title "${title}" for Comick search.`);
    for (const site of websites) {
      const candidateLink = await site.searchFunc(title);
      if (candidateLink && await verifyLink(candidateLink, title)) {
        results[site.name].add(candidateLink);
      }
    }
  } else {
    // For adult content, iterate over all candidate titles.
    for (const title of titles) {
      console.log(`\n=== Trying title "${title}" ===`);
      for (const site of websites) {
        console.log(`Trying ${site.name} for title "${title}"`);
        const candidateLink = await site.searchFunc(title);
        if (candidateLink && await verifyLink(candidateLink, title)) {
          results[site.name].add(candidateLink);
        }
      }
    }
  }

  // Convert sets to arrays and remove keys with empty arrays.
  const finalResults = {};
  for (const site of websites) {
    const siteLinks = Array.from(results[site.name]);
    if (siteLinks.length > 0) {
      finalResults[site.name] = siteLinks;
    }
  }
  if (Object.keys(finalResults).length === 0) {
    return null;
  }
  return finalResults;
}

module.exports = {
  searchExternal
};
