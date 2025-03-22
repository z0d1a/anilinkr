// src/components/SearchTab.js
import React, { useState } from 'react';
import { searchTitle } from '../services/api';
import './SearchTab.css';

const SearchTab = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await searchTitle(query);
      setResult(data.link);
    } catch (err) {
      console.error(err);
      setError('No link found');
    }
    setLoading(false);
  };

  return (
    <div className="search-tab-container">
      <h2>Search Manga</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Type a manga title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {loading && <p className="loading-text">Searching...</p>}
      {error && <p className="error-text">{error}</p>}
      {result && (
        <div className="search-result">
          <p>Found link:</p>
          <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
