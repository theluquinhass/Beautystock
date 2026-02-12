import { useState, useEffect, useContext, createContext } from 'react';
import { getCurrentUserProfile } from '../lib/planUtils';
import { useAuth } from '../contexts/AuthContext';

const PlanContext = createContext({});

export function PlanProvider({ children }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to refresh profile (e.g. after upgrade)
    const refreshPlan = async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const data = await getCurrentUserProfile();
            setProfile(data);
        } catch (error) {
            console.error("Failed to load plan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPlan();
    }, [user]);

    return (
        <PlanContext.Provider value={{ profile, loading, isPro: profile?.plan === 'pro', refreshPlan }}>
            {children}
        </PlanContext.Provider>
    );
}

export function usePlan() {
    return useContext(PlanContext);
}
