import React from 'react';
import './ExternalLinks.css';

const ExternalLinks = ({ links }) => {
  return (
    <div className="external-links-container">
      {Object.keys(links).map((site) => (
        <div key={site} className="external-links-group">
          <h4>{site}</h4>
          <div className="external-links-grid">
            {links[site].map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link-card"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExternalLinks;
