/**
 * BeautyStock - Utilitários de Privacidade e Mascaramento de Dados
 * 
 * Minimiza a exposição de dados pessoais na UI e em logs.
 * Use estas funções SEMPRE que exibir dados de clientes na tela.
 */

/**
 * Mascara um número de telefone, preservando os primeiros 4 e últimos 2 dígitos.
 * Ex: "(11) 99876-5432" → "(11) 9●●●●-●●32"
 */
export function maskPhone(phone) {
    if (!phone || phone.length < 8) return phone || '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length <= 6) return phone;
    const visible = clean.slice(0, 4);
    const hidden = '●'.repeat(clean.length - 6);
    const tail = clean.slice(-2);
    return `${visible}${hidden}${tail}`;
}

/**
 * Mascara um email preservando os primeiros 2 caracteres e o domínio.
 * Ex: "maria.silva@gmail.com" → "ma●●●●●●●●●@gmail.com"
 */
export function maskEmail(email) {
    if (!email || !email.includes('@')) return email || '';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local.slice(0, 2)}${'●'.repeat(local.length - 2)}@${domain}`;
}

/**
 * Mascara um CPF preservando os 3 primeiros e os 2 últimos dígitos.
 * Ex: "123.456.789-01" → "123.●●●.●●●-01"
 */
export function maskCPF(cpf) {
    if (!cpf) return '';
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return `${clean.slice(0, 3)}.●●●.●●●-${clean.slice(-2)}`;
}

/**
 * Mascara o nome completo, mostrando apenas o primeiro nome e a inicial do sobrenome.
 * Ex: "Maria da Silva Santos" → "Maria S."
 * Útil para exibir nomes de clientes na dashboard sem exposição total.
 */
export function maskFullName(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return parts[0] || '';
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
}

/**
 * Formata valor monetário para exibição segura (sem centavos expostos em logs).
 * Ex: 1549.90 → "R$ 1.549,90"  
 */
export function formatCurrency(value) {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Sanitiza dados de cliente antes de log—remove campos sensíveis.
 * Nunca envie o objeto original do Supabase direto pro console.log.
 */
export function sanitizeForLog(obj) {
    if (!obj) return {};
    const { cpf, phone, email, password, token, ...safe } = obj;
    return {
        ...safe,
        ...(cpf ? { cpf: '***masked***' } : {}),
        ...(phone ? { phone: '***masked***' } : {}),
        ...(email ? { email: maskEmail(email) } : {}),
    };
}
