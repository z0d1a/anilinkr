import React, { useContext, useEffect } from 'react';
import { ExternalSearchContext } from '../context/ExternalSearchContext';
import './GlobalSearchIndicator.css';

const GlobalSearchIndicator = () => {
  const { isSearchDisabled } = useContext(ExternalSearchContext);

  useEffect(() => {
    console.log('GlobalSearchIndicator - isSearchDisabled:', isSearchDisabled);
  }, [isSearchDisabled]);

  if (!isSearchDisabled) {
    return null;
  }

  return (
    <div className="global-search-indicator">
      <div className="indicator-spinner"></div>
      <span>Searching external links...</span>
    </div>
  );
};

export default GlobalSearchIndicator;
