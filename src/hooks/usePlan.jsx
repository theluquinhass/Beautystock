import { useState, useEffect, useContext, createContext } from 'react';
import { subscriptionService } from '../services/subscription.service';
import { useAuth } from '../contexts/AuthContext';

const PlanContext = createContext({});

export function PlanProvider({ children }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshPlan = async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const data = await subscriptionService.getProfile();
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

    const isPro = subscriptionService.isPro(profile);

    return (
        <PlanContext.Provider value={{ profile, loading, isPro, refreshPlan }}>
            {children}
        </PlanContext.Provider>
    );
}

export function usePlan() {
    return useContext(PlanContext);
}

