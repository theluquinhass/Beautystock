import { supabase } from '../lib/supabase';

export const customerService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(customerData) {
        const { data, error } = await supabase
            .from('customers')
            .insert(customerData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
