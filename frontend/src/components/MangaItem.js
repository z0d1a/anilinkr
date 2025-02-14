import React, { useState, useContext } from 'react';
import ExternalLinks from './ExternalLinks';
import { searchExternalLinks } from '../services/api';
import { ExternalSearchContext } from '../context/ExternalSearchContext';
import './MangaItem.css';

const MangaItem = ({ manga, viewMode }) => {
  const { isSearchDisabled, setSearchDisabled } = useContext(ExternalSearchContext);
  const [externalLinks, setExternalLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Toggle for showing external links
  const [showLinks, setShowLinks] = useState(false);
  // Toggle to show full URLs (only in grid view)
  const [showFullLinks, setShowFullLinks] = useState(false);
  // For adult content cover blur toggle.
  const [coverBlurred, setCoverBlurred] = useState(
    manga.media.isAdult ? true : false
  );

  const handleToggleLinks = async () => {
    if (isSearchDisabled) {
      console.log("External search in progress, please wait.");
      return;
    }
    if (externalLinks) {
      setShowLinks(!showLinks);
      return;
    }
    setSearchDisabled(true);
    setLoading(true);
    setError(null);
    try {
      const data = await searchExternalLinks(manga.media.id);
      console.log('Fetched external links for manga', manga.media.id, data);
      setExternalLinks(data);
      setShowLinks(true);
    } catch (err) {
      console.error('Error fetching external links:', err);
      setError('Failed to fetch external links');
    }
    setLoading(false);
    // Re-enable after a cooldown.
    setTimeout(() => {
      setSearchDisabled(false);
    }, 2000);
  };

  // Cover image (large if available, else medium)
  const coverUrl =
    manga.media.coverImage &&
    (manga.media.coverImage.large || manga.media.coverImage.medium);

  // Render for grid view.
  if (viewMode === 'grid') {
    return (
      <div className="manga-item-card grid">
        <div className="manga-cover-container-grid">
          {coverUrl ? (
            <>
              <img
                src={coverUrl}
                alt={`${manga.media.title.userPreferred} cover`}
                className={`manga-cover-grid ${manga.media.isAdult && coverBlurred ? 'blur' : ''}`}
              />
              {manga.media.isAdult && coverBlurred && (
                <button
                  className="reveal-cover-btn-grid"
                  onClick={() => setCoverBlurred(false)}
                >
                  Reveal Cover
                </button>
              )}
            </>
          ) : (
            <div className="cover-placeholder-grid">No Image</div>
          )}
        </div>
        <div className="manga-info-grid">
          <h3 className="manga-title-grid" title={manga.media.title.userPreferred}>
            {manga.media.title.userPreferred}
          </h3>
          {manga.media.title.native && (
            <p className="manga-native-title-grid">Native: {manga.media.title.native}</p>
          )}
          {typeof manga.progress === 'number' && (
            <p className="manga-progress-grid">Progress: {manga.progress}</p>
          )}
        </div>
        <div className="manga-item-actions-grid">
          <button
            onClick={handleToggleLinks}
            className="toggle-links-button-grid"
            disabled={isSearchDisabled}
          >
            {showLinks ? 'Hide External Links' : 'Show External Links'}
          </button>
        </div>
        {loading && <p className="loading-text">Loading external links...</p>}
        {error && <p className="error-text">{error}</p>}
        {showLinks && externalLinks && Object.keys(externalLinks).length > 0 && (
          <div className="external-links-grid">
            {Object.entries(externalLinks).map(([site, links]) => (
              <div key={site} className="external-site-grid">
                <span className="external-site-label">{site}: </span>
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link-grid"
                  >
                    Link {index + 1}
                  </a>
                ))}
              </div>
            ))}
            <button
              onClick={() => setShowFullLinks(!showFullLinks)}
              className="toggle-full-links-btn-grid"
            >
              {showFullLinks ? 'Hide Full Links' : 'Show Full Links'}
            </button>
            {showFullLinks && (
              <div className="external-links-full-grid">
                {Object.entries(externalLinks).map(([site, links]) => (
                  <div key={site} className="external-full-site-grid">
                    <strong>{site}:</strong>
                    <ul>
                      {links.map((link, index) => (
                        <li key={index}>
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {showLinks && externalLinks && Object.keys(externalLinks).length === 0 && (
          <p className="no-links-text">No external links available.</p>
        )}
      </div>
    );
  }

  // Render for list view.
  return (
    <div className="manga-item-card list">
      <div className="manga-item-header">
        {coverUrl && (
          <div className="cover-wrapper">
            <img
              src={coverUrl}
              alt={`${manga.media.title.userPreferred} cover`}
              className={`manga-cover ${manga.media.isAdult && coverBlurred ? 'blur' : ''}`}
            />
            {manga.media.isAdult && coverBlurred && (
              <button
                className="reveal-cover-btn"
                onClick={() => setCoverBlurred(false)}
              >
                Reveal Cover
              </button>
            )}
          </div>
        )}
        <div className="manga-title-section">
          <h3>{manga.media.title.userPreferred}</h3>
          {manga.media.title.native && (
            <p className="manga-native-title">Native: {manga.media.title.native}</p>
          )}
          {typeof manga.progress === 'number' && (
            <p className="manga-progress">Progress: {manga.progress}</p>
          )}
        </div>
      </div>
      <div className="manga-item-actions">
        <button
          onClick={handleToggleLinks}
          className="toggle-links-button"
          disabled={isSearchDisabled}
        >
          {showLinks ? 'Hide External Links' : 'Show External Links'}
        </button>
      </div>
      {loading && <p>Loading external links...</p>}
      {error && <p className="error-text">{error}</p>}
      {showLinks && externalLinks && Object.keys(externalLinks).length > 0 && (
        <ExternalLinks links={externalLinks} />
      )}
      {showLinks && externalLinks && Object.keys(externalLinks).length === 0 && (
        <p>No external links available.</p>
      )}
    </div>
  );
};

export default MangaItem;
