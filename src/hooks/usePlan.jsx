import { useState, useEffect, useContext, createContext } from 'react';
import { subscriptionService } from '../services/subscription.service';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FREE_LIMITS } from '../lib/planUtils';

const PlanContext = createContext({});

export function PlanProvider({ children }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Usage state for Free Tier blocks
    const [usage, setUsage] = useState({
        productsCount: 0,
        customersCount: 0,
        categoriesCount: 0,
        activeDebtsCount: 0,
        monthlySalesCount: 0,
        photosCount: 0,
        catalogVisibleProductsCount: 0
    });

    const fetchUsage = async (userId) => {
        try {
            // Get first day of current month for sales count
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            // Run multiple count queries in parallel to be efficient
            const [
                { count: productsCount },
                { count: customersCount },
                { count: categoriesCount },
                { count: activeDebtsCount },
                { count: monthlySalesCount },
                { count: photosCount },
                { count: catalogVisibleProductsCount }
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
                supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('categories').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', userId).gt('debt', 0),
                supabase.from('movements').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'sale').gte('date', firstDayOfMonth),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId).not('image_path', 'is', null).eq('is_active', true),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('show_in_catalog', true).eq('is_active', true)
            ]);

            setUsage({
                productsCount: productsCount || 0,
                customersCount: customersCount || 0,
                categoriesCount: categoriesCount || 0,
                activeDebtsCount: activeDebtsCount || 0,
                monthlySalesCount: monthlySalesCount || 0,
                photosCount: photosCount || 0,
                catalogVisibleProductsCount: catalogVisibleProductsCount || 0
            });
        } catch (error) {
            console.error("Failed to load usage counts", error);
        }
    };

    const refreshPlan = async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const data = await subscriptionService.getProfile();
            setProfile(data);

            // If they are free, we need the counts. We can get it for pro too, for analytics/displays
            await fetchUsage(user.id);

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
    const limits = FREE_LIMITS;

    return (
        <PlanContext.Provider value={{ profile, loading, isPro, limits, usage, refreshPlan }}>
            {children}
        </PlanContext.Provider>
    );
}

export function usePlan() {
    return useContext(PlanContext);
}

