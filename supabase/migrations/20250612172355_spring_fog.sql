-- Add user_id column to all tables for user-specific data

-- Add user_id to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Add user_id to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Add user_id to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Add user_id to portfolio_settings table
ALTER TABLE portfolio_settings ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Add user_id to user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Add user_id to journal_entries table
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Add user_id to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'pasham@yash.com';

-- Create indexes for user_id columns for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_settings_user_id ON portfolio_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Public access for trades" ON trades;
DROP POLICY IF EXISTS "Public access for assets" ON assets;
DROP POLICY IF EXISTS "Public access for goals" ON goals;
DROP POLICY IF EXISTS "Public access for portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Public access for user_settings" ON user_settings;
DROP POLICY IF EXISTS "Public access for journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Public access for transactions" ON transactions;

-- Create user-specific policies (allowing access to specific user's data)
CREATE POLICY "User access for trades" ON trades FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');
CREATE POLICY "User access for assets" ON assets FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');
CREATE POLICY "User access for goals" ON goals FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');
CREATE POLICY "User access for portfolio_settings" ON portfolio_settings FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');
CREATE POLICY "User access for user_settings" ON user_settings FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');
CREATE POLICY "User access for journal_entries" ON journal_entries FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');
CREATE POLICY "User access for transactions" ON transactions FOR ALL USING (user_id = 'pasham@yash.com') WITH CHECK (user_id = 'pasham@yash.com');