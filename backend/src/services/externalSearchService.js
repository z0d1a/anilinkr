const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Performs a fetch request using headers that closely mimic a real browser.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<Response>}
 */
async function fetchWithHeaders(url) {
  const headers = {
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
 * For Omegascans: if response is OK, we assume it is valid.
 * For Toongod and Comick: if a 403 is returned (anti‑bot), we assume it’s valid.
 * Otherwise, if response is OK, we can inspect the HTML.
 *
 * @param {string} url - The candidate URL.
 * @param {string} candidateTitle - The title used to generate this URL.
 * @returns {Promise<boolean>}
 */
async function verifyLink(url, candidateTitle) {
  try {
    const response = await fetchWithHeaders(url);
    // For Omegascans: if response.ok, assume URL is valid.
    if (url.includes("omegascans.org") && response.ok) {
      return true;
    }
    // For Toongod: if status 403, assume it's valid.
    if (url.includes("toongod.org/webtoon") && response.status === 403) {
      console.log(`verifyLink: Received 403 for "${url}". Assuming it is valid for Toongod.`);
      return true;
    }
    // For Comick: if status 403, assume it's valid.
    if (url.includes("comick.io/comic") && response.status === 403) {
      console.log(`verifyLink: Received 403 for "${url}". Assuming it is valid for Comick.`);
      return true;
    }
    // If response is OK, we may inspect the HTML.
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
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
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
    const response = await fetch(url, {
      method: 'GET',
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36" }
    });
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
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
 */
async function searchOmegascansScrape(title) {
  const searchUrl = `https://omegascans.org/?s=${encodeURIComponent(title)}`;
  console.log(`[Omegascans] Searching via scrape at: ${searchUrl}`);
  try {
    const response = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36" }
    });
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
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
 */
async function searchOmegascans(title) {
  let link = await searchOmegascansDirect(title);
  if (link) return link;
  return await searchOmegascansScrape(title);
}

/* ============================================
   Toongod Search Strategies
   ============================================ */

/**
 * Attempts to find the manga on Toongod using a direct URL.
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
 */
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

/**
 * Attempts to find the manga on Toongod by scraping the search results.
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
 */
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

/**
 * Searches Toongod for the manga using both strategies.
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
 */
async function searchToongod(title) {
  let link = await searchToongodDirect(title);
  if (link) return link;
  return await searchToongodScrape(title);
}

/* ============================================
   Comick Search Strategy (for Non‑Adult Manga)
   ============================================ */

/**
 * Attempts to find the manga on Comick using a direct URL.
 * Note: Comick links are structured as:
 *   https://comick.io/comic/00-{slug}
 * where the slug is normalized.
 * @param {string} title - The manga title.
 * @returns {Promise<string|null>}
 */
async function searchComick(title) {
  const slug = normalizeTitle(title);
  if (!slug) {
    console.log(`[Comick] Skipping title "${title}" (cannot normalize)`);
    return null;
  }
  // Prepend "00-" to the slug for Comick.
  const url = `https://comick.io/comic/00-${slug}`;
  console.log(`[Comick] Trying direct URL: ${url}`);
  try {
    const response = await fetchWithHeaders(url);
    // Even if we get a 403 for a comick URL, assume it is valid.
    if (response.ok || response.status === 403) {
      console.log(`[Comick] Direct URL ${response.ok ? 'exists' : 'returned 403'}: ${url}`);
      if (await verifyLink(url, title)) return url;
    } else {
      console.log(`[Comick] Direct URL failed with status ${response.status}`);
    }
    return null;
  } catch (error) {
    console.error(`[Comick] Direct URL error for "${title}": ${error}`);
    return null;
  }
}

/* ============================================
   Combined External Search Across Websites
   ============================================ */

/**
 * Iterates over an array of candidate titles and tries external search functions.
 * Returns an object with website keys and an array of unique links for each.
 *
 * For adult manga, only Omegascans and Toongod are used.
 * For non-adult manga, only Comick is used.
 *
 * @param {string[]} titles - Array of candidate titles.
 * @param {boolean} isAdult - True if the manga is adult content.
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
      { name: 'Comick', searchFunc: searchComick }
    ];
  }

  // Use an object with Set values for uniqueness.
  const results = {};
  for (const site of websites) {
    results[site.name] = new Set();
  }

  for (const title of titles) {
    console.log(`\n=== Trying title "${title}" ===`);
    for (const site of websites) {
      console.log(`Trying ${site.name} for title "${title}"`);
      const candidateLink = await site.searchFunc(title);
      if (candidateLink) {
        if (await verifyLink(candidateLink, title)) {
          results[site.name].add(candidateLink);
        } else {
          console.log(`Verification failed for candidate link: ${candidateLink}`);
        }
      }
    }
  }

  // Convert sets to arrays and remove keys with empty arrays.
  const finalResults = {};
  for (const site of websites) {
    const links = Array.from(results[site.name]);
    if (links.length > 0) {
      finalResults[site.name] = links;
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
