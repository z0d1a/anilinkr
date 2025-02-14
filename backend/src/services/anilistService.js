// backend/src/services/anilistService.js
const fetch = require('node-fetch');
const { ANILIST_API_URL, ANILIST_USER } = process.env;

const MANGA_LIST_QUERY = `
  query ($userName: String) {
    MediaListCollection(userName: $userName, type: MANGA) {
      lists {
        name
        entries {
          id
          progress         # Added this field for user progress
          status
          score
          updatedAt
          media {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            synonyms
            description
            isAdult
            tags {
              name
              isAdult
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
          }
        }
      }
    }
  }
`;

async function getMangaList() {
  try {
    const variables = { userName: ANILIST_USER };
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: MANGA_LIST_QUERY,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.MediaListCollection;
  } catch (error) {
    console.error('Error fetching manga list:', error);
    throw error;
  }
}

module.exports = {
  getMangaList
};
