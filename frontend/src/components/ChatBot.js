import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // <-- NEW
import { getChatRecommendation } from '../services/api';
import './ChatBot.css';

const ChatBot = () => {
  const [preferences, setPreferences] = useState({
    isAdult: false,
    genres: '',
    similarTo: '',
    description: ''
  });
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const recommendation = await getChatRecommendation(preferences);
      setResponse(recommendation.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="chatbot-container">
      <h2>anilinkrAI.</h2>
      <form onSubmit={handleSubmit} className="chatbot-form">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isAdult"
              checked={preferences.isAdult}
              onChange={handleChange}
            />
            Include Adult Content
          </label>
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="genres"
            placeholder="Preferred genres (comma separated)"
            value={preferences.genres}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="similarTo"
            placeholder="Similar to (title name)"
            value={preferences.similarTo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="What kind of story are you looking for?"
            value={preferences.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        {/* The button is now centered via CSS (see ChatBot.css below). */}
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Get Recommendations'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Render the response as Markdown */}
      {response && (
        <div className="recommendation-response">
          <h3>Recommendations:</h3>
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
