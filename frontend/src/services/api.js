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

export async function searchTitle(query) {
  const response = await fetch(`/api/search/title?title=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
}


export async function getChatRecommendation(preferences) {
  // Add full backend URL with port
  const response = await fetch('http://localhost:5001/api/chat/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Changed from 'token' to 'authToken'
    },
    body: JSON.stringify(preferences)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}