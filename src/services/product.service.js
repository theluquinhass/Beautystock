import { supabase } from '../lib/supabase';

export const productService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('products')
            .select(`*, variations(id, name, stock_quantity), categories(id, name, color)`) // Optimized select
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('products')
            .select(`*, variations(*), categories(id, name, color)`)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(productData) {
        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
    }
};
