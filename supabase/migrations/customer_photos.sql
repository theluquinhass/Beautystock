-- Add photo_path column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS photo_path TEXT;

-- Instructions: Create the bucket manually if it doesn't exist.
-- Name: customer-photos
-- Public: true

-- Enable RLS for the customer-photos bucket if not already enabled via Supabase UI
-- (Omitted here to avoid errors if RLS was already enabled for all buckets, but best practice is to check the dashboard)

-- Drop existing policies if any to recreate them cleanly (optional, but good for idempotency)
DROP POLICY IF EXISTS "Public access to customer photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own customer photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own customer photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own customer photos" ON storage.objects;

-- Create policies for customer-photos bucket

-- 1. Allow public read access (so avatars can be displayed in the app)
CREATE POLICY "Public access to customer photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'customer-photos');

-- 2. Allow authenticated users to upload files ONLY into their own user_id folder
CREATE POLICY "Users can upload their own customer photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow authenticated users to update files ONLY in their own user_id folder
CREATE POLICY "Users can update their own customer photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'customer-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to delete files ONLY in their own user_id folder
CREATE POLICY "Users can delete their own customer photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'customer-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
