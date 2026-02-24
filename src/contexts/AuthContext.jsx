import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        authService.getSession().then((session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch(err => {
            console.error("Auth initialization error:", err);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        user,
        signOut: authService.signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

