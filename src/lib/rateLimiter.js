/**
 * BeautyStock - Rate Limiter (Frontend)
 * 
 * Protege contra abuso de requisições repetidas em ações sensíveis:
 * - Login / Signup (Brute force)
 * - Formulários de pagamento (Double-click)
 * - Webhooks públicos chamados pelo client-side
 * 
 * Uso:
 *   import { rateLimiter } from '../lib/rateLimiter';
 *   if (!rateLimiter.canProceed('login')) {
 *       toast.error('Muitas tentativas. Aguarde alguns segundos.');
 *       return;
 *   }
 */

const limits = new Map();

const DEFAULT_CONFIG = {
    maxAttempts: 5,
    windowMs: 60_000,   // 1 minuto
};

const ACTION_CONFIGS = {
    login:      { maxAttempts: 5,  windowMs: 60_000 },
    signup:     { maxAttempts: 3,  windowMs: 120_000 },
    otp:        { maxAttempts: 5,  windowMs: 120_000 },
    payment:    { maxAttempts: 3,  windowMs: 30_000 },
    upload:     { maxAttempts: 10, windowMs: 60_000 },
    api_call:   { maxAttempts: 30, windowMs: 60_000 },
};

export const rateLimiter = {
    /**
     * Verifica se a ação pode prosseguir conforme o rate limit.
     * @param {string} action - Nome da ação (ex: 'login', 'signup', 'payment')
     * @returns {boolean} true se pode prosseguir, false se bloqueado
     */
    canProceed(action) {
        const config = ACTION_CONFIGS[action] || DEFAULT_CONFIG;
        const now = Date.now();

        if (!limits.has(action)) {
            limits.set(action, { attempts: [], blocked_until: 0 });
        }

        const state = limits.get(action);

        // Ainda bloqueado?
        if (state.blocked_until > now) {
            return false;
        }

        // Limpa tentativas antigas fora da janela
        state.attempts = state.attempts.filter(t => t > now - config.windowMs);

        // Verifica se atingiu o limite
        if (state.attempts.length >= config.maxAttempts) {
            // Bloqueia por mais uma janela
            state.blocked_until = now + config.windowMs;
            return false;
        }

        // Registra a tentativa
        state.attempts.push(now);
        return true;
    },

    /**
     * Reseta o rate limit de uma ação (ex: após login bem-sucedido)
     */
    reset(action) {
        limits.delete(action);
    },

    /**
     * Retorna os segundos restantes de bloqueio, ou 0 se não está bloqueado
     */
    getWaitTime(action) {
        const state = limits.get(action);
        if (!state) return 0;
        const remaining = state.blocked_until - Date.now();
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    },
};
