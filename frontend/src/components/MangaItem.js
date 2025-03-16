// src/components/MangaList.js
import React, { useState, useEffect } from 'react';
import { getMangaList } from '../services/api';
import MangaItem from './MangaItem';
import Fuse from 'fuse.js';
import './MangaList.css';

const MangaList = () => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Filter mode: 'adult', 'nonadult', or 'all'
  const [filterMode, setFilterMode] = useState('nonadult');
  const [searchQuery, setSearchQuery] = useState('');
  // "list" or "grid"
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMangaList();
        // Flatten all lists into one array.
        const allEntries = data.lists.flatMap(list => list.entries);
        // Deduplicate entries using media.id as key.
        const dedupedMap = new Map();
        allEntries.forEach(entry => {
          if (!dedupedMap.has(entry.media.id)) {
            dedupedMap.set(entry.media.id, entry);
          } else {
            // Keep the entry with the most recent updatedAt.
            const existing = dedupedMap.get(entry.media.id);
            if (entry.updatedAt > existing.updatedAt) {
              dedupedMap.set(entry.media.id, entry);
            }
          }
        });
        const dedupedEntries = Array.from(dedupedMap.values());
        // Sort by updatedAt descending.
        dedupedEntries.sort((a, b) => b.updatedAt - a.updatedAt);
        setMangaList(dedupedEntries);
      } catch (err) {
        setError('Failed to fetch manga list');
      }
      setLoading(false);
    };

    fetchManga();
  }, []);

  // Adult filter: a manga is considered adult if media.isAdult is true 
  // and at least one tag has isAdult === false (as per your logic).
  const isAdultContent = (manga) => {
    const mediaAdult = manga.media.isAdult === true;
    const tagAdult =
      manga.media.tags &&
      manga.media.tags.some(tag => tag.isAdult === false);
    return mediaAdult && tagAdult;
  };

  // Apply filter based on the current filterMode.
  let filteredManga;
  if (filterMode === 'adult') {
    filteredManga = mangaList.filter(manga => isAdultContent(manga));
  } else if (filterMode === 'nonadult') {
    filteredManga = mangaList.filter(manga => !isAdultContent(manga));
  } else {
    // 'all' – show all manga.
    filteredManga = mangaList;
  }

  // Apply Fuse.js fuzzy search on the filtered list.
  let displayedManga = filteredManga;
  if (searchQuery.trim()) {
    const fuseOptions = {
      keys: [
        'media.title.userPreferred',
        'media.title.english',
        'media.title.native',
        'media.synonyms'
      ],
      threshold: 0.3, // Adjust threshold for desired fuzziness.
    };
    const fuse = new Fuse(filteredManga, fuseOptions);
    const results = fuse.search(searchQuery);
    displayedManga = results.map(result => result.item);
  }

  if (loading) return <p>Loading manga list...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!mangaList.length) return <p>No manga found.</p>;

  return (
    <div className="manga-list-container">
      <h2>Manga List (Sorted by Last Updated)</h2>
      <div className="control-panel">
        <div className="filter-buttons">
          <button
            onClick={() => setFilterMode('adult')}
            className={filterMode === 'adult' ? 'active' : ''}
          >
            Adult Only
          </button>
          <button
            onClick={() => setFilterMode('nonadult')}
            className={filterMode === 'nonadult' ? 'active' : ''}
          >
            Non-Adult Only
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={filterMode === 'all' ? 'active' : ''}
          >
            Show All
          </button>
        </div>
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'active' : ''}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'active' : ''}
          >
            Grid View
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search manga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {displayedManga.length === 0 ? (
        <p>No manga match your search.</p>
      ) : (
        <div className={`manga-list ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
          {displayedManga.map(manga => (
            <MangaItem key={manga.media.id} manga={manga} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaList;
