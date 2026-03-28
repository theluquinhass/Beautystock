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
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        // Sempre limpar storage local por segurança
        localStorage.clear();
        sessionStorage.clear();
        
        if (error) {
            console.warn('[AUTH] Session already invalidated or network error:', error.message);
        }
        
        // Força um redirect hard em vez de confiar apenas no react-router para garantir a limpeza do React Tree
        window.location.href = '/login';
    },

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    async resetPasswordForEmail(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    }
};
