-- Add detailed product fields to match the old shop_inventory-main structure

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS model_suffix TEXT,
ADD COLUMN IF NOT EXISTS work_type TEXT,
ADD COLUMN IF NOT EXISTS embellishment TEXT,
ADD COLUMN IF NOT EXISTS fabric TEXT;

-- Update the schema cache for PostgREST to recognize the new columns immediately
NOTIFY pgrst, 'reload schema';
