/*
  # Add New Product Type Constraint

  1. Changes
    - Add new product_type constraint with restaurant-specific types
    - Types: kebab, chicken, kjottsaus, kjottdeig, bacon
    
  2. Notes
    - Data has been updated to match new types
    - This reflects the actual products used in the restaurant
*/

-- Add new constraint with updated types
ALTER TABLE cooling_logs 
ADD CONSTRAINT cooling_logs_product_type_check 
CHECK (product_type = ANY (ARRAY['kebab'::text, 'chicken'::text, 'kjottsaus'::text, 'kjottdeig'::text, 'bacon'::text]));