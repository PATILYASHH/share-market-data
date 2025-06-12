import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error checking and logging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
}

console.log('Supabase configuration loaded:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable auth persistence for now to avoid auth-related issues
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('trades').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string;
          date: string;
          time: string;
          asset: string;
          direction: 'long' | 'short';
          entry_price: number;
          exit_price: number | null;
          position_size: number;
          strategy: string;
          reasoning: string;
          market_conditions: string;
          tags: string[];
          screenshots: string[];
          is_open: boolean;
          pnl: number | null;
          fees: number;
          emotional_state: 'confident' | 'nervous' | 'neutral' | 'excited' | 'frustrated';
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          time: string;
          asset: string;
          direction: 'long' | 'short';
          entry_price: number;
          exit_price?: number | null;
          position_size: number;
          strategy: string;
          reasoning?: string;
          market_conditions?: string;
          tags?: string[];
          screenshots?: string[];
          is_open?: boolean;
          pnl?: number | null;
          fees?: number;
          emotional_state?: 'confident' | 'nervous' | 'neutral' | 'excited' | 'frustrated';
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          time?: string;
          asset?: string;
          direction?: 'long' | 'short';
          entry_price?: number;
          exit_price?: number | null;
          position_size?: number;
          strategy?: string;
          reasoning?: string;
          market_conditions?: string;
          tags?: string[];
          screenshots?: string[];
          is_open?: boolean;
          pnl?: number | null;
          fees?: number;
          emotional_state?: 'confident' | 'nervous' | 'neutral' | 'excited' | 'frustrated';
          created_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          symbol: string;
          name: string;
          category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
          exchange: string | null;
          sector: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          name: string;
          category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
          exchange?: string | null;
          sector?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          name?: string;
          category?: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
          exchange?: string | null;
          sector?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          type: 'daily' | 'weekly' | 'monthly' | 'yearly';
          target: number;
          current_value: number;
          deadline: string;
          description: string;
          is_active: boolean;
          priority: 'low' | 'medium' | 'high';
          category: 'profit' | 'winrate' | 'trades' | 'drawdown';
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'daily' | 'weekly' | 'monthly' | 'yearly';
          target: number;
          current_value?: number;
          deadline: string;
          description: string;
          is_active?: boolean;
          priority?: 'low' | 'medium' | 'high';
          category: 'profit' | 'winrate' | 'trades' | 'drawdown';
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
          target?: number;
          current_value?: number;
          deadline?: string;
          description?: string;
          is_active?: boolean;
          priority?: 'low' | 'medium' | 'high';
          category?: 'profit' | 'winrate' | 'trades' | 'drawdown';
          created_at?: string;
        };
      };
      portfolio_settings: {
        Row: {
          id: string;
          initial_capital: number;
          current_balance: number;
          max_daily_loss: number;
          max_daily_loss_percentage: number;
          max_position_size: number;
          max_position_size_percentage: number;
          risk_reward_ratio: number;
          currency: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          initial_capital?: number;
          current_balance?: number;
          max_daily_loss?: number;
          max_daily_loss_percentage?: number;
          max_position_size?: number;
          max_position_size_percentage?: number;
          risk_reward_ratio?: number;
          currency?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          initial_capital?: number;
          current_balance?: number;
          max_daily_loss?: number;
          max_daily_loss_percentage?: number;
          max_position_size?: number;
          max_position_size_percentage?: number;
          risk_reward_ratio?: number;
          currency?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          theme: 'light' | 'dark' | 'auto';
          currency: string;
          timezone: string;
          date_format: string;
          notifications: any;
          risk_management: any;
          trading_hours: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          theme?: 'light' | 'dark' | 'auto';
          currency?: string;
          timezone?: string;
          date_format?: string;
          notifications?: any;
          risk_management?: any;
          trading_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme?: 'light' | 'dark' | 'auto';
          currency?: string;
          timezone?: string;
          date_format?: string;
          notifications?: any;
          risk_management?: any;
          trading_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          date: string;
          title: string;
          content: string;
          mood: 'positive' | 'negative' | 'neutral';
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          title: string;
          content: string;
          mood?: 'positive' | 'negative' | 'neutral';
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          title?: string;
          content?: string;
          mood?: 'positive' | 'negative' | 'neutral';
          tags?: string[];
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          date: string;
          amount: number;
          type: 'deposit' | 'withdrawal';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          amount: number;
          type: 'deposit' | 'withdrawal';
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          amount?: number;
          type?: 'deposit' | 'withdrawal';
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
}