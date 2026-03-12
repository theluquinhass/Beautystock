-- Migration to add webhook idempotency and better tracking
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    provider TEXT DEFAULT 'mercadopago',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add last_payment_id for better tracking as requested
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_payment_id TEXT;

-- Enable RLS for the new table (though only service role will use it)
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Comment for clarity
COMMENT ON TABLE public.processed_webhooks IS 'Track processed webhooks to prevent duplicate actions (idempotency)';
COMMENT ON COLUMN public.profiles.last_payment_id IS 'ID of the last processed payment (single payment flow)';
