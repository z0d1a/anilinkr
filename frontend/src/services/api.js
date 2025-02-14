// src/services/api.js

export async function getMangaList() {
    try {
      const response = await fetch('http://localhost:5001/api/anilist/manga');
      if (!response.ok) {
        throw new Error('Error fetching manga list');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  export async function searchExternalLinks(mangaId) {
    try {
      const response = await fetch(`http://localhost:5001/api/search/manga/${mangaId}`);
      if (!response.ok) {
        throw new Error('Error searching external links');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  