import { supabase } from './supabase';

export const FREE_LIMITS = {
    products: 50,
    product_photos: 30,
    categories: 5,
    monthly_sales: 60,
    customers: 5,
    active_debts: 10,
    catalog_enabled: true,
    catalog_visible_products: 20,
    dashboard_profit_chart_days: 7,
    bibi_alerts_limit: 3,
    export_csv: false,
    whatsapp_smart_charge_tones: false
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
        return { id: user.id, plan: 'free' };
    }

    return data;
}

/**
 * Checks if the user is PRO.
 */
export function isProUser(profile) {
    return profile?.plan === 'pro';
}

// ==========================================
// Check Functions
// ==========================================

export function canAddProduct(profile, currentCount) {
    if (isProUser(profile)) return true;
    return currentCount < FREE_LIMITS.products;
}

export function canAddPhoto(profile, currentPhotosCount) {
    if (isProUser(profile)) return true;
    return currentPhotosCount < FREE_LIMITS.product_photos;
}

export function canAddCustomer(profile, currentCount) {
    if (isProUser(profile)) return true;
    return currentCount < FREE_LIMITS.customers;
}

export function canAddCategory(profile, currentCount) {
    if (isProUser(profile)) return true;
    return currentCount < FREE_LIMITS.categories;
}

export function canRegisterSale(profile, currentMonthSalesCount) {
    if (isProUser(profile)) return true;
    return currentMonthSalesCount < FREE_LIMITS.monthly_sales;
}

export function canAddActiveDebt(profile, currentActiveDebtsCount) {
    if (isProUser(profile)) return true;
    return currentActiveDebtsCount < FREE_LIMITS.active_debts;
}

export function canShowCatalogMoreThan(profile, requestedAmount) {
    if (isProUser(profile)) return true;
    return requestedAmount <= FREE_LIMITS.catalog_visible_products;
}

export function canUseExport(profile) {
    if (isProUser(profile)) return true;
    return FREE_LIMITS.export_csv;
}

export function canUseBibiFull(profile) {
    if (isProUser(profile)) return true;
    // Free only gets up to `bibi_alerts_limit`
    return false;
}

export function canUseSmartWhatsAppCharge(profile) {
    if (isProUser(profile)) return true;
    return FREE_LIMITS.whatsapp_smart_charge_tones;
}
