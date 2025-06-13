/*
  # Trading Journal Database Schema

  1. New Tables
    - `trades` - Store all trading transactions
    - `assets` - Store trading assets/instruments
    - `goals` - Store user trading goals
    - `portfolio_settings` - Store portfolio configuration
    - `user_settings` - Store user preferences
    - `journal_entries` - Store trading journal entries
    - `transactions` - Store deposits/withdrawals

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (no auth required)
    - All users can read/write all data
*/

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  time text NOT NULL,
  asset text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price decimal NOT NULL,
  exit_price decimal,
  position_size decimal NOT NULL,
  strategy text NOT NULL,
  reasoning text DEFAULT '',
  market_conditions text DEFAULT '',
  tags text[] DEFAULT '{}',
  screenshots text[] DEFAULT '{}',
  is_open boolean DEFAULT false,
  pnl decimal,
  fees decimal DEFAULT 0,
  emotional_state text DEFAULT 'neutral' CHECK (emotional_state IN ('confident', 'nervous', 'neutral', 'excited', 'frustrated')),
  created_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('stocks', 'crypto', 'forex', 'commodities', 'indices', 'options')),
  exchange text,
  sector text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'yearly')),
  target decimal NOT NULL,
  current_value decimal DEFAULT 0,
  deadline text NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category text NOT NULL CHECK (category IN ('profit', 'winrate', 'trades', 'drawdown')),
  created_at timestamptz DEFAULT now()
);

-- Create portfolio_settings table
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_capital decimal NOT NULL DEFAULT 10000,
  current_balance decimal NOT NULL DEFAULT 10000,
  max_daily_loss decimal DEFAULT 500,
  max_daily_loss_percentage decimal DEFAULT 5,
  max_position_size decimal DEFAULT 1000,
  max_position_size_percentage decimal DEFAULT 10,
  risk_reward_ratio decimal DEFAULT 2,
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'America/New_York',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'America/New_York',
  date_format text DEFAULT 'MM/DD/YYYY',
  notifications jsonb DEFAULT '{"dailyLossLimit": true, "goalProgress": true, "tradeReminders": false}',
  risk_management jsonb DEFAULT '{"maxDailyLoss": 500, "maxDailyLossPercentage": 5, "maxPositionSize": 1000, "maxPositionSizePercentage": 10, "riskRewardRatio": 2, "stopLossRequired": false, "takeProfitRequired": false}',
  trading_hours jsonb DEFAULT '{"start": "09:30", "end": "16:00", "timezone": "America/New_York"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  mood text DEFAULT 'neutral' CHECK (mood IN ('positive', 'negative', 'neutral')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  amount decimal NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Public access for trades" ON trades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for portfolio_settings" ON portfolio_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for journal_entries" ON journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
CREATE INDEX IF NOT EXISTS idx_trades_asset ON trades(asset);
CREATE INDEX IF NOT EXISTS idx_trades_is_open ON trades(is_open);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);

-- Insert default portfolio settings if none exist
INSERT INTO portfolio_settings (initial_capital, current_balance, currency)
SELECT 10000, 10000, 'USD'
WHERE NOT EXISTS (SELECT 1 FROM portfolio_settings);

-- Insert default user settings if none exist
INSERT INTO user_settings (theme, currency, timezone)
SELECT 'light', 'USD', 'America/New_York'
WHERE NOT EXISTS (SELECT 1 FROM user_settings);