import { supabase } from './supabase';

/**
 * Initiates the checkout process for the PRO plan (Card - Subscription).
 * Calls the Supabase Edge Function 'create-subscription' which now uses the Asaas API.
 */
export async function startProCheckout() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
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
                finalMessage = error.details.message || error.details.error || finalMessage;
            }

            throw new Error(finalMessage);
        }

        // Asaas returns init_point (invoiceUrl) for the hosted checkout
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
 * Inicia o fluxo de checkout transparente via PIX (Copia e Cola + QR Code).
 * Chama a Edge Function 'create-pix-payment' que agora usa a API do Asaas.
 */
export const startProTransparentPix = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Usuário não autenticado');

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase.functions.invoke('create-pix-payment', {
            body: {
                userId: user.id,
                email: user.email
            }
        });

        if (error) {
            console.error("Function error details:", error);
            let finalMessage = error.message;

            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    if (body) {
                        finalMessage = body.error || body.message || finalMessage;
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

        // Return PIX data for the UI (same interface as before)
        return {
            paymentId: data.paymentId,
            qrCode: data.qrCode,           // Pix copia-e-cola payload
            qrCodeBase64: data.qrCodeBase64 // Base64 image for QR code
        };

    } catch (error) {
        console.error('Error starting transparent PRO PIX:', error);
        throw error;
    }
};

/**
 * Inicia checkout via Asaas (redirect para página de pagamento hospedada).
 * Chama a Edge Function 'create-preference' que retorna invoiceUrl do Asaas.
 */
export const startProPixCheckout = async () => {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Auth error in checkout:', userError);
            throw new Error('Você precisa estar logado para assinar.');
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        const { data, error } = await supabase.functions.invoke('create-preference', {
            body: {
                userId: user.id,
                email: user.email
            }
        });

        if (error) {
            console.error('Checkout invoke error:', error);
            let finalMessage = error.message;

            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    if (body) {
                        finalMessage = body.error || body.message || finalMessage;
                    }
                } catch (e) {
                    console.warn('Could not parse error response body:', e);
                }
            } else if (error.details && typeof error.details === 'object') {
                finalMessage = error.details.message || error.details.error || finalMessage;
            }

            throw new Error(finalMessage);
        }

        // Asaas returns invoiceUrl for the hosted checkout page
        if (data?.invoiceUrl) {
            window.location.href = data.invoiceUrl;
        } else {
            console.error('Invalid success response without invoiceUrl:', data);
            throw new Error('Resposta inválida do servidor ao gerar link de pagamento.');
        }

    } catch (error) {
        console.error('Full checkout error:', error);
        throw error;
    }
};
