-- === BEAUTYSTOCK: HARDENING DE SEGURANÇA E RLS ===
-- Objetivo: Garantir isolamento Multi-Tenant e blindar modificações de Plano/Assinatura pelo Frontend.

-- 1. Forçar RLS ativo em todas as tabelas cruciais do negócio
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- 2. Limpar Políticas Inseguras (Caso Existam Antigas)
-- Obs: Comentado para evitar erros caso não existam, habilitar via admin manual se necessário
-- DROP POLICY IF EXISTS "Public can view active products" ON public.products;


-- 3. POLÍTICA DE ISOLAMENTO (PRODUCTS)
-- O usuário logado só LÊ, INSERE, ATUALIZA e DELETA os produtos em que a coluna `user_id` é o `auth.uid()` dele.
CREATE POLICY "Strict Tenant Isolation - Products" ON public.products
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- NOTA: O acesso público ao catálogo é feito via a RPC `get_public_catalog` (SECURITY DEFINER).
-- Não é necessária policy de SELECT público na tabela `products` diretamente.


-- 4. POLÍTICA DE ISOLAMENTO (CUSTOMERS e MOVEMENTS)
CREATE POLICY "Strict Tenant Isolation - Customers" ON public.customers
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict Tenant Isolation - Movements" ON public.movements
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 5. BLINDAGEM DE "MASS ASSIGNMENT" NO PERFIL (PROFILES)
-- Remover a permissão global do usuário de dar UPDATE em campos controlados pelo sistema (ex: plan, expires_at)
-- Vamos criar uma regra restrita para Profile:

CREATE POLICY "Users can fully manage their own profiles" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Um usuário pode dar UPDATE no seu perfil...
CREATE POLICY "Users can update non-sensitive profile fields" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ... MAS NÓS RETIRAMOS A PERMISSÃO DE ALTERAR O PLANO DIRETAMENTE.
-- O PostgREST e a Rola 'authenticated' não vão poder setar `plan` e `expires_at`.
-- Somente o Backend / Edge Function com a Role 'service_role' consegue dar bypass no RLS.
REVOKE UPDATE (plan, expires_at) ON public.profiles FROM authenticated;
REVOKE UPDATE (plan, expires_at) ON public.profiles FROM anon;

-- Isso fecha a falha do usuário conseguir via Console da Web Forjar a Payload:
-- PATCH /rest/v1/profiles?id=eq.123
-- { "plan": "pro" } => Agora retorna Erro de Permissão do PostgreSQL.
