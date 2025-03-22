// src/components/FeaturedOmegascans.js
import React, { useState, useEffect } from 'react';
import FeaturedCarousel from './FeaturedCarousel';
import './FeaturedOmegascans.css';

function FeaturedOmegascans() {
  const [featuredList, setFeaturedList] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to fetch one page of featured manga.
  const fetchPage = async (page) => {
    const url = `https://api.omegascans.org/query?order=desc&orderBy=total_views&series_type=Comic&page=${page}&perPage=20&adult=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page ${page}: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData.data;
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the first page
        const data = await fetchPage(1);
        setFeaturedList(data);
        setCurrentPage(1);
        // For the carousel, randomly select up to 10 items from the data
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const randomTen = shuffled.slice(0, Math.min(10, data.length));
        setCarouselItems(randomTen);
      } catch (err) {
        console.error('Error fetching featured manga:', err);
        setError('Failed to fetch featured manga');
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  // Load More button handler: fetch the next page and append.
  const handleLoadMore = async () => {
    try {
      const nextPage = currentPage + 1;
      const data = await fetchPage(nextPage);
      setFeaturedList(prev => [...prev, ...data]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more featured manga:', err);
      setError('Failed to load more featured manga');
    }
  };

  return (
    <div className="featured-container">
      <h2>Featured Omegascans</h2>
      {loading && <p>Loading featured manga...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <>
          {carouselItems.length > 0 && (
            <FeaturedCarousel items={carouselItems} />
          )}
          <div className="featured-list">
            {featuredList.map(item => (
              <div key={item.id} className="featured-item">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="featured-cover"
                />
                <h3 className="featured-title">{item.title}</h3>
                <p className="featured-desc">
                  {item.description
                    ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 120) + '...'
                    : ''}
                </p>
                <a
                  href={`https://omegascans.org/series/${item.series_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-more-link"
                >
                  Read More
                </a>
              </div>
            ))}
          </div>
          {/* Show Load More button if currentPage is less than the known last page (e.g. 11) */}
          {currentPage < 11 && (
            <button className="load-more-btn" onClick={handleLoadMore}>
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default FeaturedOmegascans;
