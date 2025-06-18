/*
  # Set Initial Capital to ₹2,000

  1. Changes
    - Update default initial capital to ₹2,000
    - Update default current balance to ₹2,000
    - Update default max daily loss to ₹100 (5% of ₹2,000)
    - Update default max position size to ₹200 (10% of ₹2,000)
    - Update risk management defaults accordingly

  2. Updates
    - portfolio_settings: initial_capital, current_balance, max_daily_loss, max_position_size
    - user_settings: risk_management values
*/

-- Update default values in portfolio_settings table
ALTER TABLE portfolio_settings ALTER COLUMN initial_capital SET DEFAULT 2000;
ALTER TABLE portfolio_settings ALTER COLUMN current_balance SET DEFAULT 2000;
ALTER TABLE portfolio_settings ALTER COLUMN max_daily_loss SET DEFAULT 100;
ALTER TABLE portfolio_settings ALTER COLUMN max_position_size SET DEFAULT 200;

-- Update default values in user_settings table
ALTER TABLE user_settings ALTER COLUMN risk_management SET DEFAULT '{"maxDailyLoss": 100, "maxDailyLossPercentage": 5, "maxPositionSize": 200, "maxPositionSizePercentage": 10, "riskRewardRatio": 2, "stopLossRequired": false, "takeProfitRequired": false}';

-- Update existing records to use new ₹2,000 defaults if they are still using old defaults
UPDATE portfolio_settings 
SET 
  initial_capital = 2000,
  current_balance = 2000,
  max_daily_loss = 100,
  max_position_size = 200
WHERE 
  currency = 'INR' 
  AND initial_capital = 100000 
  AND current_balance = 100000 
  AND max_daily_loss = 5000 
  AND max_position_size = 10000;

UPDATE user_settings 
SET 
  risk_management = '{"maxDailyLoss": 100, "maxDailyLossPercentage": 5, "maxPositionSize": 200, "maxPositionSizePercentage": 10, "riskRewardRatio": 2, "stopLossRequired": false, "takeProfitRequired": false}'
WHERE 
  currency = 'INR' 
  AND risk_management->>'maxDailyLoss' = '5000';