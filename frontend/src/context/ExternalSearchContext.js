// src/context/ExternalSearchContext.js
import React, { createContext, useState } from 'react';

export const ExternalSearchContext = createContext();

export const ExternalSearchProvider = ({ children }) => {
  const [isSearchDisabled, setSearchDisabled] = useState(false);

  return (
    <ExternalSearchContext.Provider value={{ isSearchDisabled, setSearchDisabled }}>
      {children}
    </ExternalSearchContext.Provider>
  );
};
