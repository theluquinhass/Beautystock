-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Only admins can read admin_users
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    meta jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read audit logs, admins can insert audit logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Grant admin full access to important tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'customers', 'products', 'movements', 'subscriptions', 'payments', 'notifications', 'catalog_settings', 'categories', 'product_variations', 'customer_photos', 'catalog_categories')
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Admins have full access to %I" ON public.%I;
            CREATE POLICY "Admins have full access to %I" ON public.%I
                FOR ALL
                TO authenticated
                USING (public.is_admin())
                WITH CHECK (public.is_admin());
        ', t, t, t, t);
    END LOOP;
END
$$;

-- Insert initial admin user by email if they exist in auth.users
DO $$
DECLARE
    v_admin_email text := 'beautystockapp@gmail.com';
    v_admin_id uuid;
BEGIN
    SELECT id INTO v_admin_id FROM auth.users WHERE email = v_admin_email LIMIT 1;
    
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.admin_users (user_id) 
        VALUES (v_admin_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END
$$;
