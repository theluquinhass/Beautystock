-- Add subscription fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mp_customer_id TEXT,
ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mp_customer_id ON profiles(mp_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(mp_subscription_id);

-- Comment on columns
COMMENT ON COLUMN profiles.mp_customer_id IS 'Mercado Pago Customer ID';
COMMENT ON COLUMN profiles.mp_subscription_id IS 'Mercado Pago Preapproval (Subscription) ID';
COMMENT ON COLUMN profiles.plan IS 'User plan: free or pro';
