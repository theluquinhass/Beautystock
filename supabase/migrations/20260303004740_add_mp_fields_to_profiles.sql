-- Adiciona campos de integração com o Mercado Pago na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mp_customer_id text,
ADD COLUMN IF NOT EXISTS mp_subscription_id text;
