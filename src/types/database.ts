export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          time: string;
          asset: string;
          direction: 'long' | 'short';
          entry_price: number;
          exit_price: number | null;
          position_size: number;
          strategy: string;
          reasoning: string | null;
          market_conditions: string | null;
          tags: string[] | null;
          is_open: boolean;
          pnl: number | null;
          fees: number | null;
          emotional_state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          time: string;
          asset: string;
          direction: 'long' | 'short';
          entry_price: number;
          exit_price?: number | null;
          position_size: number;
          strategy: string;
          reasoning?: string | null;
          market_conditions?: string | null;
          tags?: string[] | null;
          is_open?: boolean;
          pnl?: number | null;
          fees?: number | null;
          emotional_state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          time?: string;
          asset?: string;
          direction?: 'long' | 'short';
          entry_price?: number;
          exit_price?: number | null;
          position_size?: number;
          strategy?: string;
          reasoning?: string | null;
          market_conditions?: string | null;
          tags?: string[] | null;
          is_open?: boolean;
          pnl?: number | null;
          fees?: number | null;
          emotional_state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          name: string;
          category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
          exchange: string | null;
          sector: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          name: string;
          category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
          exchange?: string | null;
          sector?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          name?: string;
          category?: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
          exchange?: string | null;
          sector?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_settings: {
        Row: {
          id: string;
          user_id: string;
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
          user_id: string;
          initial_capital: number;
          current_balance: number;
          max_daily_loss: number;
          max_daily_loss_percentage: number;
          max_position_size: number;
          max_position_size_percentage: number;
          risk_reward_ratio: number;
          currency: string;
          timezone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
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
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          type: 'deposit' | 'withdrawal';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          amount: number;
          type: 'deposit' | 'withdrawal';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          amount?: number;
          type?: 'deposit' | 'withdrawal';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: 'daily' | 'weekly' | 'monthly' | 'yearly';
          target: number;
          current: number;
          deadline: string;
          description: string;
          is_active: boolean;
          priority: 'low' | 'medium' | 'high';
          category: 'profit' | 'winrate' | 'trades' | 'drawdown';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'daily' | 'weekly' | 'monthly' | 'yearly';
          target: number;
          current?: number;
          deadline: string;
          description: string;
          is_active?: boolean;
          priority: 'low' | 'medium' | 'high';
          category: 'profit' | 'winrate' | 'trades' | 'drawdown';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
          target?: number;
          current?: number;
          deadline?: string;
          description?: string;
          is_active?: boolean;
          priority?: 'low' | 'medium' | 'high';
          category?: 'profit' | 'winrate' | 'trades' | 'drawdown';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
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
          user_id: string;
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
          user_id?: string;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}