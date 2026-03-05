import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAccount() {
    console.log("🔍 Buscando usuário beautystockapp@gmail.com...");

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error("Erro ao buscar usuários:", authError);
        return;
    }

    const user = users.find(u => u.email === 'beautystockapp@gmail.com');

    if (!user) {
        console.log("❌ Usuário beautystockapp@gmail.com não encontrado!");
        return;
    }

    const userId = user.id;
    console.log(`✅ Usuário encontrado: ${userId}`);

    // Deletar movimentações
    const { error: errorMovements } = await supabase.from('movements').delete().eq('user_id', userId);
    if (errorMovements) {
        console.error("Erro ao deletar movimentações:", errorMovements);
    } else {
        console.log("✅ Movimentações deletadas com sucesso.");
    }

    // Buscar todos os produtos do usuário para poder deletar as variações
    const { data: products, error: errorSearchProducts } = await supabase.from('products').select('id').eq('user_id', userId);

    if (products && products.length > 0) {
        const productIds = products.map(p => p.id);

        // Deletar variações baseadas nos produtos
        const { error: errorVariations } = await supabase.from('variations').delete().in('product_id', productIds);
        if (errorVariations) {
            console.error("Erro ao deletar variações:", errorVariations);
        } else {
            console.log("✅ Variações deletadas com sucesso.");
        }
    }

    // Deletar os produtos
    const { error: errorProducts } = await supabase.from('products').delete().eq('user_id', userId);
    if (errorProducts) {
        console.error("Erro ao deletar produtos:", errorProducts);
    } else {
        console.log("✅ Produtos deletados com sucesso.");
    }

    console.log("🎉 Reset finalizado para beautystockapp@gmail.com!");
}

resetAccount();
