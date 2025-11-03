/*
  # Remove Old Product Type Constraint

  1. Changes
    - Drop the old product_type constraint that limits to (meat, fish, poultry, other)
    - This allows us to update the data and add a new constraint
*/

-- Drop the old constraint
ALTER TABLE cooling_logs 
DROP CONSTRAINT IF EXISTS cooling_logs_product_type_check;