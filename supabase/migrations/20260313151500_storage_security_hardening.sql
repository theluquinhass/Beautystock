-- === BEAUTYSTOCK: HARDENING DE STORAGE ===
-- Objetivo: Impedir que agentes maliciosos façam upload de shells, scripts SVG (XSS) ou malwares dentro dos buckets de "product-images" ou "customer-photos".

-- 1. Cria a política de INSERT travada nas extensões JPG, PNG, WEBP permitindo apenas Autenticados para a SUA própria pasta
CREATE POLICY "Strict Image Upload Policy - Products"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'product-images' AND 
    (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
    AND auth.uid() = owner
);

-- 2. Faz o mesmo para as fotos de clientes (Caso exista bucket de avatar)
CREATE POLICY "Strict Image Upload Policy - Customers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'customer-photos' AND 
    (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
    AND auth.uid() = owner
);

-- 3. Previne deleção/update de mídia de outros tenants no Storage
CREATE POLICY "Strict Image Delete Policy"
ON storage.objects FOR DELETE TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Strict Image Update Policy"
ON storage.objects FOR UPDATE TO authenticated
USING (auth.uid() = owner);
