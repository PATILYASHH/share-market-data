/*
  # Remove All Currencies Except INR

  1. Changes
    - Update all currency fields to only support INR
    - Remove currency selection options from database constraints
    - Ensure all existing data uses INR
    - Update default values to INR only

  2. Updates
    - portfolio_settings: force currency to INR
    - user_settings: force currency to INR
    - Remove any currency validation that allows other currencies
*/

-- Update all existing portfolio_settings to use INR
UPDATE portfolio_settings SET currency = 'INR' WHERE currency != 'INR';

-- Update all existing user_settings to use INR  
UPDATE user_settings SET currency = 'INR' WHERE currency != 'INR';

-- Update default values to only use INR
ALTER TABLE portfolio_settings ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE user_settings ALTER COLUMN currency SET DEFAULT 'INR';

-- Add a comment to indicate INR-only policy
COMMENT ON COLUMN portfolio_settings.currency IS 'Currency is fixed to INR (Indian Rupees) only';
COMMENT ON COLUMN user_settings.currency IS 'Currency is fixed to INR (Indian Rupees) only';