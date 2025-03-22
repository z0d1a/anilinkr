import React, { useState } from 'react';
import './SpotlightSearch.css';

/**
 * SpotlightSearch:
 *  - Renders a button ("Search") that opens a modal overlay
 *  - The modal contains an input field + site selection (Comick/Omegascans)
 *  - We show results below the input (via either Comick’s or Omegascans’ API)
 */
function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Which site to search: "comick" or "omegascans"
  const [searchSite, setSearchSite] = useState('comick');

  // 1) Toggling the overlay
  const openSearch = () => setIsOpen(true);
  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setError(null);
  };

  // 2) The actual search logic
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (searchSite === 'comick') {
        // --- Comick search logic ---
        const searchUrl = `https://api.comick.io/v1.0/search/?page=1&limit=5&showall=false&q=${encodeURIComponent(query)}&t=false`;
        const resp = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Accept': 'application/json, text/plain, */*',
          },
        });
        if (!resp.ok) {
          setError(`Comick search failed with status ${resp.status}`);
          setLoading(false);
          return;
        }
        const data = await resp.json();
        let newResults = [];
        if (Array.isArray(data)) {
          newResults = data;
        } else {
          newResults = [data];
        }
        setResults(newResults);

      } else {
        // --- Omegascans search logic ---
        // We fetch only the first page, returning up to 20-ish results.
        // adult=true to match the default? Or you can set it to false if you want only safe results.
        const searchUrl = `https://api.omegascans.org/query?adult=true&query_string=${encodeURIComponent(query)}&page=1`;
        const resp = await fetch(searchUrl);
        if (!resp.ok) {
          setError(`Omegascans search failed with status ${resp.status}`);
          setLoading(false);
          return;
        }
        const data = await resp.json();
        // data.data is the array of manga objects
        const newResults = data.data || [];
        setResults(newResults);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search. Check console.');
    }
    setLoading(false);
  };

  // 3) Trigger handleSearch when user presses Enter or clicks "Go"
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 4) Render
  return (
    <>
      {/* The “Search” button (visible at all times) */}
      <button className="spotlight-trigger-btn" onClick={openSearch}>
        Search
      </button>

      {/* The overlay modal if isOpen */}
      {isOpen && (
        <div className="spotlight-overlay">
          {/* The dark backdrop first, so the modal is above it */}
          <div className="spotlight-backdrop" onClick={closeSearch}></div>

          {/* The modal on top */}
          <div className="spotlight-modal">
            <div className="spotlight-header">
              <h2>Search {searchSite === 'comick' ? 'ComicK' : 'OmegaScans'}</h2>
              <button className="close-btn" onClick={closeSearch}>
                ✕
              </button>
            </div>

            <div className="spotlight-body">
              {/* Radio toggle for site selection */}
              <div className="spotlight-site-toggle">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="site"
                    value="comick"
                    checked={searchSite === 'comick'}
                    onChange={() => setSearchSite('comick')}
                  />
                  <span className="custom-radio" />
                  ComicK
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="site"
                    value="omegascans"
                    checked={searchSite === 'omegascans'}
                    onChange={() => setSearchSite('omegascans')}
                  />
                  <span className="custom-radio" />
                  OmegaScans
                </label>
              </div>

              {/* Input + "Go" button on the same row */}
              <div className="spotlight-input-row">
                <input
                  type="text"
                  className="spotlight-input"
                  placeholder={`Type a title for ${searchSite}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <button className="search-btn" onClick={handleSearch}>
                  Go
                </button>
              </div>

              {loading && <p className="loading-text">Searching...</p>}
              {error && <p className="error-text">{error}</p>}

              {/* Render results */}
              {results.length > 0 && (
                <div className="spotlight-results">
                  {searchSite === 'comick' ? (
                    // Comick result structure
                    results.map((item, idx) => {
                      const slug = item.slug || (item[0] && item[0].slug);
                      const finalUrl = slug
                        ? `https://comick.io/comic/${slug}`
                        : null;

                      return (
                        <div className="spotlight-result-item" key={idx}>
                          <h4>
                            {item.title || 'No Title'}
                            {item.country && <span> [{item.country}]</span>}
                          </h4>
                          {finalUrl && (
                            <a
                              href={finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="spotlight-result-link"
                            >
                              {finalUrl}
                            </a>
                          )}
                          <p>{item.desc ? item.desc.slice(0, 120) + '...' : ''}</p>
                        </div>
                      );
                    })
                  ) : (
                    // Omegascans result structure
                    results.map((manga, idx) => {
                      // e.g. { series_slug, title, thumbnail, description, ... }
                      const finalUrl = `https://omegascans.org/series/${manga.series_slug}`;
                      return (
                        <div className="spotlight-result-item" key={idx}>
                          <h4>{manga.title || 'No Title'}</h4>
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spotlight-result-link"
                          >
                            {finalUrl}
                          </a>
                          {manga.description && (
                            <p>{manga.description.slice(0, 120) + '...'}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SpotlightSearch;
