import { supabase } from '../lib/supabase';

export const authService = {
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async getUser() {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    async resetPasswordForEmail(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
    }
};
