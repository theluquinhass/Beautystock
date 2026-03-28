import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'beautystock-theme';

export const ThemeContext = createContext({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: () => {},
});

function getSystemTheme() {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    } catch {
        // localStorage not available
    }
    return 'system';
}

function applyTheme(resolved) {
    const root = document.documentElement;
    if (resolved === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getStoredTheme);
    const [resolvedTheme, setResolvedTheme] = useState(() => {
        const stored = getStoredTheme();
        return stored === 'system' ? getSystemTheme() : stored;
    });

    // Apply theme to DOM
    const updateResolved = useCallback((newTheme) => {
        const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    // Set theme with persistence
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch {
            // localStorage not available
        }

        // Smooth transition
        document.documentElement.classList.add('theme-transition');
        updateResolved(newTheme);
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 350);
    }, [updateResolved]);

    // Initial application
    useEffect(() => {
        updateResolved(theme);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const newResolved = e.matches ? 'dark' : 'light';
            setResolvedTheme(newResolved);
            applyTheme(newResolved);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        resolvedTheme,
        setTheme,
    }), [theme, resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
