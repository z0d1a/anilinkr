// src/components/FeaturedComick.js
import React, { useEffect, useState } from 'react';
import FeaturedComickCarousel from './FeaturedComickCarousel'; 
// ^ the new carousel
import './FeaturedComick.css';

function FeaturedComick() {
  const [comickItems, setComickItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeatured();
    // NOTE: remove or disable the "react-hooks/exhaustive-deps" error 
    // by installing eslint-plugin-react-hooks properly, or just remove the comment.
  }, [page]);

  async function fetchFeatured() {
    try {
      setLoading(true);
      setError(null);

      // Example: fetch top 20 by 'view' sort from Comick
      const apiUrl = `https://api.comick.fun/v1.0/search?limit=49&sort=user_follow_count&page=${page}`;
      console.log('[FeaturedComick] Fetching from:', apiUrl);

      const resp = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      });
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      let data = await resp.json();

      console.log('[FeaturedComick] Raw data:', data);

      // If no more data, set hasMore to false
      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        // For each item, the array might have "md_covers"
        // We store them directly. If we want to combine with older data:
        setComickItems(prev => [...prev, ...data]);
      }
    } catch (err) {
      console.error('Failed to fetch Comick data:', err);
      setError('Failed to fetch featured Comick');
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }

  return (
    <div className="featured-comick-container">
      <h2 className="featured-comick-heading">Featured Comick</h2>

      {/* 
        1) The new Carousel at the top, 
           maybe you only pass the first 10 items or random items:
      */}
      {comickItems.length > 0 && (
        <FeaturedComickCarousel items={comickItems.slice(0, 10)} />
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 
        2) The grid of all comick items below 
      */}
      <div className="featured-comick-list">
        {comickItems.map((item, index) => {
          // Build the cover from md_covers
          let coverUrl = '';
          if (item.md_covers && item.md_covers.length > 0) {
            const b2key = item.md_covers[0].b2key;
            coverUrl = `https://meo.comick.pictures/${b2key}`;
          } else {
            coverUrl = 'https://via.placeholder.com/200x300?text=No+Cover';
          }

          const finalUrl = item.slug
            ? `https://comick.io/comic/${item.slug}`
            : null;
          const title = item.title || 'Untitled';
          const desc = item.desc || '';

          return (
            <div key={index} className="featured-comick-item">
              {finalUrl ? (
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="comick-link"
                >
                  <img
                    src={coverUrl}
                    alt={title}
                    className="comick-cover"
                  />
                  <h4 className="comick-title">{title}</h4>
                </a>
              ) : (
                <>
                  <img
                    src={coverUrl}
                    alt={title}
                    className="comick-cover"
                  />
                  <h4 className="comick-title">{title}</h4>
                </>
              )}
              <p className="comick-desc">
                {desc.length > 100 ? desc.slice(0, 100) + '...' : desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <button className="comick-load-more-btn" onClick={handleLoadMore}>
          Load More
        </button>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}

export default FeaturedComick;
