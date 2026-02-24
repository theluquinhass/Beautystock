import { supabase } from '../lib/supabase';

export const subscriptionService = {
    async startCheckout(email) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: {
                userId: user.id,
                email: email || user.email
            }
        });

        if (error) throw error;

        if (data?.init_point) {
            return data.init_point;
        } else {
            throw new Error('URL de checkout não gerada');
        }
    },

    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error);
            // Default fallback
            return { id: user.id, plan: 'free' };
        }

        // If no proifle found, return default (or potentially create one)
        if (!data) {
            return { id: user.id, plan: 'free' };
        }

        return data;
    },

    isPro(profile) {
        return profile?.plan === 'pro';
    }
};
