// src/App.js
import React from 'react';
import MangaList from './components/MangaList';
import GlobalSearchIndicator from './components/GlobalSearchIndicator';
import Header from './components/Header';
import { ExternalSearchProvider } from './context/ExternalSearchContext';
import './App.css';

function App() {
  const username = "hashashin"; // Replace with your actual username
  const avatar = "https://s4.anilist.co/file/anilistcdn/user/avatar/large/b415658-gCNEb2qYYhLp.png"; // Replace with the actual avatar URL (from AniList, for example)

  return (
    <ExternalSearchProvider>
      <div className="App">
        <GlobalSearchIndicator />
        <Header username={username} avatar={avatar} />
        <div className="content">
          <MangaList />
        </div>
      </div>
    </ExternalSearchProvider>
  );
}

export default App;
