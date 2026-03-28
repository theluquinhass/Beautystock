/**
 * BeautyStock - Camada de Validação e Sanitização
 * 
 * Centraliza TODOS os schemas de validação do sistema.
 * Uso: importe o schema e chame .parse(data) ou .safeParse(data) antes de enviar ao Supabase.
 * 
 * Regras de segurança:
 * - Nunca confie em dados do formulário diretamente.
 * - Sempre valide antes de qualquer .insert() ou .update().
 * - Campos sensíveis (plan, expires_at) NUNCA entram em schemas de frontend.
 */
import { z } from 'zod';

// ============================================================
// SANITIZADORES
// ============================================================

/**
 * Remove caracteres potencialmente perigosos de strings de input.
 * Protege contra XSS em campos que possam ser renderizados.
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Sanitiza um objeto inteiro, aplicando sanitizeString em todas as strings.
 */
export function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

// ============================================================
// SCHEMAS DE AUTENTICAÇÃO
// ============================================================

export const loginSchema = z.object({
    email: z.string().email('Email inválido').max(255).toLowerCase().trim(),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(128),
});

export const signupSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).trim(),
    email: z.string().email('Email inválido').max(255).toLowerCase().trim(),
    password: z
        .string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .max(128)
        .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
});

// ============================================================
// SCHEMAS DE PRODUTOS
// ============================================================

export const productSchema = z.object({
    name: z.string().min(2, 'Nome obrigatório').max(150).trim(),
    price: z.number().nonnegative('Preço não pode ser negativo').max(999999.99),
    cost_price: z.number().nonnegative('Custo não pode ser negativo').max(999999.99).optional().nullable(),
    stock: z.number().int('Estoque deve ser inteiro').nonnegative('Estoque não pode ser negativo').max(99999),
    category: z.string().max(100).trim().optional().nullable(),
    sku: z.string().max(50).trim().optional().nullable(),
    description: z.string().max(500).trim().optional().nullable(),
});

// ============================================================
// SCHEMAS DE CLIENTES
// ============================================================

export const customerSchema = z.object({
    name: z.string().min(2, 'Nome obrigatório').max(100).trim(),
    phone: z.string().max(20).trim().optional().nullable(),
    email: z.string().email('Email inválido').max(255).optional().nullable().or(z.literal('')),
    notes: z.string().max(500).trim().optional().nullable(),
});

// ============================================================
// SCHEMAS DE MOVIMENTAÇÕES (VENDAS / ENTRADAS)
// ============================================================

export const movementItemSchema = z.object({
    product_id: z.string().uuid('ID de produto inválido'),
    quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
    unit_price: z.number().nonnegative('Preço unitário inválido'),
});

export const movementSchema = z.object({
    type: z.enum(['sale', 'entry'], { errorMap: () => ({ message: 'Tipo deve ser "sale" ou "entry"' }) }),
    items: z.array(movementItemSchema).min(1, 'Pelo menos um item é obrigatório'),
    customer_id: z.string().uuid().optional().nullable(),
    discount: z.number().nonnegative().max(999999.99).optional().default(0),
    discount_type: z.enum(['fixed', 'percentage']).optional().default('fixed'),
    notes: z.string().max(500).trim().optional().nullable(),
});

// ============================================================
// SCHEMAS DE PERFIL (Apenas campos que O USUÁRIO pode alterar)
// ============================================================
// ATENÇÃO: Campos `plan`, `expires_at`, `role` estão DELIBERADAMENTE AUSENTES.
// Eles SÓ podem ser modificados por Edge Functions com `service_role`.

export const profileUpdateSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    phone: z.string().max(20).trim().optional().nullable(),
    cpf: z.string().max(14).trim().optional().nullable(),
    avatar_url: z.string().url().max(500).optional().nullable(),
});

// ============================================================
// SCHEMAS DE CATÁLOGO
// ============================================================

export const catalogSettingsSchema = z.object({
    store_name: z.string().min(2, 'Nome da loja obrigatório').max(100).trim(),
    store_description: z.string().max(300).trim().optional().nullable(),
    whatsapp: z.string().max(20).trim().optional().nullable(),
    instagram: z.string().max(100).trim().optional().nullable(),
    theme_color: z.string().max(7).regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional().nullable(),
});

// ============================================================
// HELPER: Validar e retornar erros amigáveis
// ============================================================

/**
 * Valida dados contra um schema Zod e retorna erros formatados.
 * @param {z.ZodSchema} schema - O schema Zod
 * @param {object} data - Os dados a serem validados
 * @returns {{ success: boolean, data?: object, errors?: string[] }}
 */
export function validateForm(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors = result.error.issues.map(
        (issue) => issue.message
    );
    return { success: false, errors };
}

// ============================================================
// VALIDAÇÃO DE UPLOAD DE ARQUIVO
// ============================================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Valida um arquivo de upload no frontend antes de enviar ao Storage.
 * Bloqueia extensões perigosas (.php, .sh, .svg, .html) e tamanhos abusivos.
 */
export function validateImageFile(file) {
    if (!file) return { valid: false, error: 'Nenhum arquivo selecionado' };

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: `Tipo de arquivo não permitido: ${file.type}. Use JPG, PNG ou WebP.` };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return { valid: false, error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB` };
    }

    // Checa a extensão real do filename (Double validation: MIME + Extension)
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExtensions.includes(ext)) {
        return { valid: false, error: `Extensão .${ext} não permitida.` };
    }

    return { valid: true };
}
