// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MangaList from './components/MangaList';
import FeaturedComick from './components/FeaturedComick'; // <-- new
import FeaturedOmegascans from './components/FeaturedOmegascans';
import GlobalSearchIndicator from './components/GlobalSearchIndicator';
import Header from './components/Header';
import ChatBot from './components/ChatBot';
import { ExternalSearchProvider } from './context/ExternalSearchContext';
import './App.css';

function App() {
  const username = "hashashin"; // Replace with your actual username
  const avatar = "https://s4.anilist.co/file/anilistcdn/user/avatar/large/b415658-gCNEb2qYYhLp.png"; // Replace with your actual avatar URL

  return (
    <ExternalSearchProvider>
      <Router>
        <div className="App">
          <GlobalSearchIndicator />
          <Header username={username} avatar={avatar} />
          <nav className="app-nav">
            <Link to="/" className="nav-link">Manga List</Link>
            <Link to="/featured" className="nav-link">Featured Adult</Link>
            <Link to="/featured-comick" className="nav-link">Featured Manga</Link>
            <Link to="/chatbot" className="nav-link">Manga Assistant</Link>
          </nav>
          <div className="content">
            <Routes>
              <Route path="/" element={<MangaList />} />
              <Route path="/featured" element={<FeaturedOmegascans />} />
              <Route path="/featured-comick" element={<FeaturedComick />} />
              <Route path="/chatbot" element={<ChatBot />} />            
            </Routes>
          </div>
        </div>
      </Router>
    </ExternalSearchProvider>
  );
}

export default App;
