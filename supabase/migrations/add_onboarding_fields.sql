-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_niche text,
ADD COLUMN IF NOT EXISTS store_goal text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- Ensure RLS allows the user to update their own profile (this is likely already in place, but good to ensure)
-- create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
