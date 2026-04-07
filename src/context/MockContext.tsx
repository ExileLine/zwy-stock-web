/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface MockContextType {
  isMock: boolean;
  setIsMock: (value: boolean) => void;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

export const MockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMock, setIsMock] = useState(() => {
    // const saved = localStorage.getItem('isMock');
    // return saved !== null ? JSON.parse(saved) : true;
    return false;
  });

  useEffect(() => {
    localStorage.setItem('isMock', JSON.stringify(isMock));
  }, [isMock]);

  return (
    <MockContext.Provider value={{ isMock, setIsMock }}>
      {children}
    </MockContext.Provider>
  );
};

export const useMock = () => {
  const context = useContext(MockContext);
  if (context === undefined) {
    throw new Error('useMock must be used within a MockProvider');
  }
  return context;
};
