import { supabase } from './supabase';

/**
 * Initiates the checkout process for the PRO plan.
 * Calls the Supabase Edge Function 'create-subscription'.
 */
export async function startProCheckout() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: { session } } = await supabase.auth.getSession();

        console.log('Session retrieved:', session ? 'Yes' : 'No');
        if (session?.access_token) {
            console.log('Token starts with:', session.access_token.substring(0, 10));
        } else {
            console.error('No access token found in session');
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: {
                userId: user.id,
                email: user.email
            },
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        if (error) throw error;

        if (data?.init_point) {
            return data.init_point;
        } else {
            throw new Error('URL de checkout não gerada');
        }

    } catch (error) {
        console.error('Erro ao iniciar checkout:', error);
        throw error;
    }
}
