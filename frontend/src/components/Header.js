// src/components/Header.js
import React from 'react';
import './Header.css';

const Header = ({ username, avatar }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Manga Tracker Dashboard</h1>
        <div className="user-info">
          <span className="username">Welcome, {username}</span>
          {avatar && (
            <img
              src={avatar}
              alt={`${username} avatar`}
              className="user-avatar"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
