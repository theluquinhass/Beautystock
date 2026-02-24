import { supabase } from '../lib/supabase';

export const movementService = {
    async getAll(limit = 100) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('movements')
            .select(`
                *, 
                variations(name, products(name)), 
                customers(name)
            `)
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    async create(movementData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Ensure user_id is set
        const payload = {
            ...movementData,
            user_id: user.id
        };

        const { data, error } = await supabase
            .from('movements')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message || 'Erro ao criar movimentação');
        }
        return data;
    },

    async getDashboardStats(startDate) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch optimized dataset for dashboard
        const { data, error } = await supabase
            .from('movements')
            .select(`
                type, 
                quantity, 
                unit_price, 
                date, 
                is_on_credit,
                variation_id
            `)
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString());

        if (error) throw error;
        return data;
    }
};
