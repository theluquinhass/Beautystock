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
            }
        });

        if (error) {
            console.error('Subscription invoke error:', error);
            let finalMessage = error.message;
            
            // Try to extract specific error message from the response body
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    if (body && (body.message || body.error)) {
                        finalMessage = body.message || (typeof body.error === 'string' ? body.error : JSON.stringify(body.error));
                    }
                } catch (e) {
                    console.warn('Could not parse error response body:', e);
                }
            } else if (error.details && typeof error.details === 'object') {
                // Some versions of supabase-js put the error body here
                finalMessage = error.details.message || error.details.error || finalMessage;
            }
            
            throw new Error(finalMessage);
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

/**
 * Inicia o fluxo de checkout transparente via PIX (Copia e Cola + QR Code)
 * Chama a Edge Function que interage com a API de Payments do Mercado Pago.
 */
export const startProTransparentPix = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Usuário não autenticado');

        const { data: { user } } = await supabase.auth.getUser();

        // Invoca a nova Edge Function de Pagamento Transparente
        const { data, error } = await supabase.functions.invoke('create-pix-payment', {
            body: {
                userId: user.id,
                email: user.email
            }
        });

        if (error) {
            console.error("Function error details:", error);
            let finalMessage = error.message;

            // Try to extract specific error message from the response body
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    if (body) {
                        finalMessage = body.error || body.message || (body.details && body.details.message) || finalMessage;
                    }
                } catch (e) {
                    console.warn('Could not parse error response body:', e);
                }
            } else if (error.details && typeof error.details === 'object') {
                finalMessage = error.details.message || error.details.error || finalMessage;
            }

            throw new Error(finalMessage);
        }

        if (!data?.success) {
            console.error("Payment API Error:", data?.error);
            throw new Error(data?.error || 'Erro ao gerar o PIX');
        }

        // Retorna os dados do PIX transparente para a UI
        return {
            paymentId: data.paymentId,
            qrCode: data.qrCode,
            qrCodeBase64: data.qrCodeBase64
        };

    } catch (error) {
        console.error('Error starting transparent PRO PIX:', error);
        throw error;
    }
};

export const startProPixCheckout = async () => {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Auth error in checkout:', userError);
            throw new Error('Você precisa estar logado para assinar.');
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
            console.log('Token starts with:', session.access_token.substring(0, 10));
        } else {
            console.error('No access token found in session');
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        const { data, error } = await supabase.functions.invoke('create-preference', {
            body: {
                userId: user.id,
                email: user.email
            }
        });

        if (error) {
            console.error('Pix Checkout invoke error:', error);
            let finalMessage = error.message;

            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    if (body) {
                        finalMessage = body.error || body.message || (body.details && body.details.message) || finalMessage;
                    }
                } catch (e) {
                    console.warn('Could not parse error response body:', e);
                }
            } else if (error.details && typeof error.details === 'object') {
                finalMessage = error.details.message || error.details.error || finalMessage;
            }

            throw new Error(finalMessage);
        }

        if (data?.initPoint) {
            window.location.href = data.initPoint;
        } else {
            console.error('Invalid success response without initPoint:', data);
            throw new Error('Resposta inválida do servidor ao gerar link PIX.');
        }

    } catch (error) {
        console.error('Full checkout error:', error);
        throw error;
    }
}
