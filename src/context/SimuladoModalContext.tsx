import { createContext, useState, useContext, ReactNode } from 'react';

interface SimuladoModalContextType {
  isSimuladoModalOpen: boolean;
  setIsSimuladoModalOpen: (isOpen: boolean) => void;
}

const SimuladoModalContext = createContext<SimuladoModalContextType | undefined>(undefined);

export const SimuladoModalProvider = ({ children }: { children: ReactNode }) => {
  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState(false);

  return (
    <SimuladoModalContext.Provider value={{ isSimuladoModalOpen, setIsSimuladoModalOpen }}>
      {children}
    </SimuladoModalContext.Provider>
  );
};

export const useSimuladoModal = () => {
  const context = useContext(SimuladoModalContext);
  if (context === undefined) {
    throw new Error('useSimuladoModal must be used within a SimuladoModalProvider');
  }
  return context;
};
