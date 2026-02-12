import { supabase } from './supabase';

/**
 * Initiates the checkout process for the PRO plan.
 * Calls the Supabase Edge Function 'create-subscription'.
 */
export async function startProCheckout() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        // Use Render URL from env or default to localhost for dev
        // In production, user should set VITE_API_URL
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const response = await fetch(`${API_URL}/create-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                email: user.email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao criar assinatura');
        }

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
