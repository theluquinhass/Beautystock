import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook for theme management.
 * @returns {{ theme: 'light' | 'dark' | 'system', resolvedTheme: 'light' | 'dark', setTheme: (theme: string) => void }}
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
