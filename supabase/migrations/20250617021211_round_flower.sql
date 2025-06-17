/*
  # Update Default Currency to Indian Rupees

  1. Changes
    - Update default currency from USD to INR in all tables
    - Update default amounts to Indian Rupee values
    - Update default timezone to Asia/Kolkata
    - Update default trading hours to Indian market hours
    - Update default date format to DD/MM/YYYY (Indian format)

  2. Updates
    - portfolio_settings: currency, amounts, timezone
    - user_settings: currency, timezone, date_format, trading_hours
*/

-- Update default values in portfolio_settings table
ALTER TABLE portfolio_settings ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE portfolio_settings ALTER COLUMN timezone SET DEFAULT 'Asia/Kolkata';
ALTER TABLE portfolio_settings ALTER COLUMN initial_capital SET DEFAULT 100000;
ALTER TABLE portfolio_settings ALTER COLUMN current_balance SET DEFAULT 100000;
ALTER TABLE portfolio_settings ALTER COLUMN max_daily_loss SET DEFAULT 5000;
ALTER TABLE portfolio_settings ALTER COLUMN max_position_size SET DEFAULT 10000;

-- Update default values in user_settings table
ALTER TABLE user_settings ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE user_settings ALTER COLUMN timezone SET DEFAULT 'Asia/Kolkata';
ALTER TABLE user_settings ALTER COLUMN date_format SET DEFAULT 'DD/MM/YYYY';
ALTER TABLE user_settings ALTER COLUMN trading_hours SET DEFAULT '{"start": "09:15", "end": "15:30", "timezone": "Asia/Kolkata"}';
ALTER TABLE user_settings ALTER COLUMN risk_management SET DEFAULT '{"maxDailyLoss": 5000, "maxDailyLossPercentage": 5, "maxPositionSize": 10000, "maxPositionSizePercentage": 10, "riskRewardRatio": 2, "stopLossRequired": false, "takeProfitRequired": false}';

-- Update existing records to use INR defaults if they are still using old defaults
UPDATE portfolio_settings 
SET 
  currency = 'INR',
  timezone = 'Asia/Kolkata',
  initial_capital = 100000,
  current_balance = 100000,
  max_daily_loss = 5000,
  max_position_size = 10000
WHERE 
  currency = 'USD' 
  AND initial_capital = 10000 
  AND current_balance = 10000 
  AND max_daily_loss = 500 
  AND max_position_size = 1000;

UPDATE user_settings 
SET 
  currency = 'INR',
  timezone = 'Asia/Kolkata',
  date_format = 'DD/MM/YYYY',
  trading_hours = '{"start": "09:15", "end": "15:30", "timezone": "Asia/Kolkata"}',
  risk_management = '{"maxDailyLoss": 5000, "maxDailyLossPercentage": 5, "maxPositionSize": 10000, "maxPositionSizePercentage": 10, "riskRewardRatio": 2, "stopLossRequired": false, "takeProfitRequired": false}'
WHERE 
  currency = 'USD' 
  AND timezone = 'America/New_York';