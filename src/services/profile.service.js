import { supabase } from '../lib/supabase';

class ProfileService {
    /**
     * Obter o perfil completo do usuário
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async getProfile(userId) {
        if (!userId) throw new Error('userId is required');

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Atualizar dados gerais do perfil
     * @param {string} userId
     * @param {Object} updates
     * @returns {Promise<Object>}
     */
    async updateProfile(userId, updates) {
        if (!userId) throw new Error('userId is required');

        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Atualizar status do onboarding
     * @param {string} userId
     * @param {Object} onboardingData - { store_niche, store_goal, onboarding_completed, onboarding_step }
     * @param {string} [name] - Optional name update if user changes it during setup
     * @returns {Promise<Object>}
     */
    async updateOnboardingStatus(userId, onboardingData, name = null) {
        if (!userId) throw new Error('userId is required');

        const updates = {
            ...onboardingData,
            updated_at: new Date().toISOString()
        };

        if (name) {
            updates.first_name = name;
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

export const profileService = new ProfileService();
