// src/context/OrdersBadgeContext.tsx
import React, { createContext, useState, useContext } from 'react';

const OrdersBadgeContext = createContext<{
  unseen: number;
  bump  : () => void;    
  clear : () => void;    
}>({ unseen: 0, bump: () => {}, clear: () => {} });

export const OrdersBadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unseen, setUnseen] = useState(0);
  return (
    <OrdersBadgeContext.Provider value={{
      unseen,
      bump : () => setUnseen(1),
      clear: () => setUnseen(0),
    }}>
      {children}
    </OrdersBadgeContext.Provider>
  );
};

export const useOrdersBadge = () => useContext(OrdersBadgeContext);
