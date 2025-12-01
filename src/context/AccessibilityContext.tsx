import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    showAccessibility: boolean;
    toggleAccessibility: () => void;
    setAccessibility: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
    const [showAccessibility, setShowAccessibility] = useState(() => {
        return localStorage.getItem('show_accessibility') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('show_accessibility', String(showAccessibility));
    }, [showAccessibility]);

    const toggleAccessibility = () => {
        setShowAccessibility((prev) => !prev);
    };

    const setAccessibility = (value: boolean) => {
        setShowAccessibility(value);
    };

    return (
        <AccessibilityContext.Provider value={{ showAccessibility, toggleAccessibility, setAccessibility }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
