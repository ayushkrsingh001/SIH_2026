import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Child } from '../types';

interface ChildContextType {
  activeChild: Child | null;
  setActiveChild: (child: Child | null) => void;
}

const ChildContext = createContext<ChildContextType>({
  activeChild: null,
  setActiveChild: () => {},
});

export const useChild = () => useContext(ChildContext);

export const ChildProvider = ({ children }: { children: ReactNode }) => {
  const [activeChild, setActiveChild] = useState<Child | null>(null);

  return (
    <ChildContext.Provider value={{ activeChild, setActiveChild }}>
      {children}
    </ChildContext.Provider>
  );
};
