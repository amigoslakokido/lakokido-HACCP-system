/*
  # Add Product Type to Cooling Logs

  1. Changes
    - Add product_type column to cooling_logs table
    - Update existing logs with default product type
  
  2. Notes
    - Product type helps categorize food items being cooled
*/

-- Add product_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cooling_logs' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE cooling_logs ADD COLUMN product_type text DEFAULT 'Annet (Other)';
  END IF;
END $$;

-- Update existing logs based on product_name if needed
UPDATE cooling_logs
SET product_type = CASE
  WHEN LOWER(product_name) LIKE '%kjøtt%' OR LOWER(product_name) LIKE '%beef%' OR LOWER(product_name) LIKE '%lamb%' OR LOWER(product_name) LIKE '%pork%' THEN 'Kjøtt (Beef, Lamb, Pork)'
  WHEN LOWER(product_name) LIKE '%kylling%' OR LOWER(product_name) LIKE '%chicken%' THEN 'Kylling (Chicken)'
  WHEN LOWER(product_name) LIKE '%fisk%' OR LOWER(product_name) LIKE '%fish%' THEN 'Fisk (Fish)'
  WHEN LOWER(product_name) LIKE '%sjømat%' OR LOWER(product_name) LIKE '%seafood%' THEN 'Sjømat (Seafood)'
  WHEN LOWER(product_name) LIKE '%suppe%' OR LOWER(product_name) LIKE '%saus%' OR LOWER(product_name) LIKE '%soup%' OR LOWER(product_name) LIKE '%sauce%' THEN 'Suppe/Saus (Soup/Sauce)'
  WHEN LOWER(product_name) LIKE '%grønnsak%' OR LOWER(product_name) LIKE '%vegetable%' THEN 'Grønnsaker (Vegetables)'
  ELSE 'Annet (Other)'
END
WHERE product_type IS NULL OR product_type = 'Annet (Other)';
