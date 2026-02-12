import { supabase } from './supabase';

export const PLANS = {
    FREE: {
        name: 'free',
        limits: {
            products: 5,
            customers: false, // Access allowed? False = No
            reports: false,
        }
    },
    PRO: {
        name: 'pro',
        limits: {
            products: Infinity,
            customers: true,
            reports: true,
        }
    }
};

/**
 * Gets the current user's profile and plan.
 */
export async function getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        // Fallback if profile doesn't exist yet (e.g. before trigger runs or legacy user)
        return { id: user.id, plan: 'free' };
    }

    return data;
}

/**
 * Checks if the user is PRO.
 * @param {object} profile - The user profile object
 */
export function isProUser(profile) {
    return profile?.plan === 'pro';
}

/**
 * Checks if the user can add more products.
 * @param {object} profile - The user profile object
 * @param {number} currentCount - Current number of products
 */
export function canAddProduct(profile, currentCount) {
    if (isProUser(profile)) return true;
    return currentCount < PLANS.FREE.limits.products;
}

/**
 * Checks if the user can access the Customers module.
 * @param {object} profile - The user profile object
 */
export function canAccessCustomers(profile) {
    if (isProUser(profile)) return true;
    return PLANS.FREE.limits.customers;
}
