// src/components/FeaturedAsurascans.js (simplified)
import React, { useState, useEffect } from 'react';

function FeaturedAsurascans() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAsuraFeatured(page);
  }, [page]);

  async function fetchAsuraFeatured(pageNum) {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetch(`/api/featured/asurascans?page=${pageNum}`);
      if (!resp.ok) {
        throw new Error(`Error fetching page ${pageNum}, status ${resp.status}`);
      }
      const data = await resp.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown server error');
      }

      // Merge or replace
      setItems(prev => (pageNum === 1 ? data.data : [...prev, ...data.data]));
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to fetch AsuraScans featured:', err);
      setError(err.message);
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
    <div>
      <h2>Featured AsuraScans</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            width: '150px', border: '1px solid #444', borderRadius: '6px',
            padding: '8px', backgroundColor: '#2a2d3a'
          }}>
            <img
              src={item.thumbnail}
              alt={item.title}
              style={{ width: '100%', borderRadius: '4px', marginBottom: '8px' }}
            />
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{item.title}</h4>
            <a
              href={item.seriesUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00afff', fontSize: '0.85rem' }}
            >
              Read on AsuraScans
            </a>
          </div>
        ))}
      </div>

      {hasMore && (
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

export default FeaturedAsurascans;
