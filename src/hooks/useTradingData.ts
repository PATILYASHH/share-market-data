import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Trade, PortfolioSettings, Goal, JournalEntry, UserSettings, Asset } from '../types';
import { Database } from '../types/database';

type DbTrade = Database['public']['Tables']['trades']['Row'];
type DbAsset = Database['public']['Tables']['assets']['Row'];
type DbGoal = Database['public']['Tables']['goals']['Row'];
type DbPortfolio = Database['public']['Tables']['portfolio_settings']['Row'];
type DbTransaction = Database['public']['Tables']['transactions']['Row'];
type DbUserSettings = Database['public']['Tables']['user_settings']['Row'];

const defaultPortfolioSettings: PortfolioSettings = {
  initialCapital: 10000,
  currentBalance: 10000,
  maxDailyLoss: 500,
  maxDailyLossPercentage: 5,
  maxPositionSize: 1000,
  maxPositionSizePercentage: 10,
  riskRewardRatio: 2,
  currency: 'USD',
  timezone: 'America/New_York',
  deposits: [],
  withdrawals: [],
};

const defaultUserSettings: UserSettings = {
  theme: 'light',
  currency: 'USD',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    dailyLossLimit: true,
    goalProgress: true,
    tradeReminders: false,
  },
  riskManagement: {
    maxDailyLoss: 500,
    maxDailyLossPercentage: 5,
    maxPositionSize: 1000,
    maxPositionSizePercentage: 10,
    riskRewardRatio: 2,
    stopLossRequired: false,
    takeProfitRequired: false,
  },
  tradingHours: {
    start: '09:30',
    end: '16:00',
    timezone: 'America/New_York',
  },
};

// Transform functions to convert between DB and app types
const transformDbTradeToTrade = (dbTrade: DbTrade): Trade => ({
  id: dbTrade.id,
  date: dbTrade.date,
  time: dbTrade.time,
  asset: dbTrade.asset,
  direction: dbTrade.direction,
  entryPrice: dbTrade.entry_price,
  exitPrice: dbTrade.exit_price || undefined,
  positionSize: dbTrade.position_size,
  strategy: dbTrade.strategy,
  reasoning: dbTrade.reasoning || '',
  marketConditions: dbTrade.market_conditions || '',
  tags: dbTrade.tags || [],
  isOpen: dbTrade.is_open,
  pnl: dbTrade.pnl || undefined,
  fees: dbTrade.fees || undefined,
  emotionalState: (dbTrade.emotional_state as any) || 'neutral',
  createdAt: dbTrade.created_at,
});

const transformTradeToDbTrade = (trade: Omit<Trade, 'id' | 'createdAt'>, userId: string): Database['public']['Tables']['trades']['Insert'] => ({
  user_id: userId,
  date: trade.date,
  time: trade.time,
  asset: trade.asset,
  direction: trade.direction,
  entry_price: trade.entryPrice,
  exit_price: trade.exitPrice || null,
  position_size: trade.positionSize,
  strategy: trade.strategy,
  reasoning: trade.reasoning || null,
  market_conditions: trade.marketConditions || null,
  tags: trade.tags || null,
  is_open: trade.isOpen,
  pnl: trade.pnl || null,
  fees: trade.fees || null,
  emotional_state: trade.emotionalState || null,
});

const transformDbAssetToAsset = (dbAsset: DbAsset): Asset => ({
  id: dbAsset.id,
  symbol: dbAsset.symbol,
  name: dbAsset.name,
  category: dbAsset.category,
  exchange: dbAsset.exchange || undefined,
  sector: dbAsset.sector || undefined,
  isActive: dbAsset.is_active,
  createdAt: dbAsset.created_at,
});

const transformAssetToDbAsset = (asset: Omit<Asset, 'id' | 'createdAt'>, userId: string): Database['public']['Tables']['assets']['Insert'] => ({
  user_id: userId,
  symbol: asset.symbol,
  name: asset.name,
  category: asset.category,
  exchange: asset.exchange || null,
  sector: asset.sector || null,
  is_active: asset.isActive,
});

const transformDbGoalToGoal = (dbGoal: DbGoal): Goal => ({
  id: dbGoal.id,
  type: dbGoal.type,
  target: dbGoal.target,
  current: dbGoal.current,
  deadline: dbGoal.deadline,
  description: dbGoal.description,
  isActive: dbGoal.is_active,
  priority: dbGoal.priority,
  category: dbGoal.category,
  createdAt: dbGoal.created_at,
});

const transformGoalToDbGoal = (goal: Omit<Goal, 'id' | 'createdAt'>, userId: string): Database['public']['Tables']['goals']['Insert'] => ({
  user_id: userId,
  type: goal.type,
  target: goal.target,
  current: goal.current,
  deadline: goal.deadline,
  description: goal.description,
  is_active: goal.isActive,
  priority: goal.priority,
  category: goal.category,
});

const transformDbPortfolioToPortfolio = (dbPortfolio: DbPortfolio, transactions: DbTransaction[]): PortfolioSettings => ({
  initialCapital: dbPortfolio.initial_capital,
  currentBalance: dbPortfolio.current_balance,
  maxDailyLoss: dbPortfolio.max_daily_loss,
  maxDailyLossPercentage: dbPortfolio.max_daily_loss_percentage,
  maxPositionSize: dbPortfolio.max_position_size,
  maxPositionSizePercentage: dbPortfolio.max_position_size_percentage,
  riskRewardRatio: dbPortfolio.risk_reward_ratio,
  currency: dbPortfolio.currency,
  timezone: dbPortfolio.timezone,
  deposits: transactions.filter(t => t.type === 'deposit').map(t => ({
    id: t.id,
    date: t.date,
    amount: t.amount,
    type: t.type,
    description: t.description || undefined,
  })),
  withdrawals: transactions.filter(t => t.type === 'withdrawal').map(t => ({
    id: t.id,
    date: t.date,
    amount: t.amount,
    type: t.type,
    description: t.description || undefined,
  })),
});

const transformDbUserSettingsToUserSettings = (dbSettings: DbUserSettings): UserSettings => ({
  theme: dbSettings.theme,
  currency: dbSettings.currency,
  timezone: dbSettings.timezone,
  dateFormat: dbSettings.date_format,
  notifications: dbSettings.notifications || defaultUserSettings.notifications,
  riskManagement: dbSettings.risk_management || defaultUserSettings.riskManagement,
  tradingHours: dbSettings.trading_hours || defaultUserSettings.tradingHours,
});

export function useTradingData() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [portfolio, setPortfolioState] = useState<PortfolioSettings>(defaultPortfolioSettings);
  const [userSettings, setUserSettingsState] = useState<UserSettings>(defaultUserSettings);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Reset data when user logs out
      setTrades([]);
      setAssets([]);
      setGoals([]);
      setPortfolioState(defaultPortfolioSettings);
      setUserSettingsState(defaultUserSettings);
      setJournalEntries([]);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadTrades(),
        loadAssets(),
        loadGoals(),
        loadPortfolio(),
        loadUserSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrades = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trades:', error);
      return;
    }

    const transformedTrades = data.map(transformDbTradeToTrade);
    setTrades(transformedTrades);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: transformedTrades }));
    }, 0);
  };

  const loadAssets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading assets:', error);
      return;
    }

    const transformedAssets = data.map(transformDbAssetToAsset);
    setAssets(transformedAssets);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: transformedAssets }));
    }, 0);
  };

  const loadGoals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    const transformedGoals = data.map(transformDbGoalToGoal);
    setGoals(transformedGoals);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: transformedGoals }));
    }, 0);
  };

  const loadPortfolio = async () => {
    if (!user) return;
    
    // Load portfolio settings
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Load transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (portfolioError && portfolioError.code !== 'PGRST116') {
      console.error('Error loading portfolio:', portfolioError);
      return;
    }

    if (transactionsError) {
      console.error('Error loading transactions:', transactionsError);
      return;
    }

    if (portfolioData) {
      const transformedPortfolio = transformDbPortfolioToPortfolio(portfolioData, transactionsData || []);
      setPortfolioState(transformedPortfolio);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: transformedPortfolio }));
      }, 0);
    } else {
      // Create default portfolio if none exists
      await createDefaultPortfolio();
    }
  };

  const loadUserSettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user settings:', error);
      return;
    }

    if (data) {
      const transformedSettings = transformDbUserSettingsToUserSettings(data);
      setUserSettingsState(transformedSettings);
    } else {
      // Create default settings if none exist
      await createDefaultUserSettings();
    }
  };

  const createDefaultPortfolio = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('portfolio_settings')
      .insert({
        user_id: user.id,
        initial_capital: defaultPortfolioSettings.initialCapital,
        current_balance: defaultPortfolioSettings.currentBalance,
        max_daily_loss: defaultPortfolioSettings.maxDailyLoss,
        max_daily_loss_percentage: defaultPortfolioSettings.maxDailyLossPercentage,
        max_position_size: defaultPortfolioSettings.maxPositionSize,
        max_position_size_percentage: defaultPortfolioSettings.maxPositionSizePercentage,
        risk_reward_ratio: defaultPortfolioSettings.riskRewardRatio,
        currency: defaultPortfolioSettings.currency,
        timezone: defaultPortfolioSettings.timezone,
      });

    if (error) {
      console.error('Error creating default portfolio:', error);
    } else {
      setPortfolioState(defaultPortfolioSettings);
    }
  };

  const createDefaultUserSettings = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        theme: defaultUserSettings.theme,
        currency: defaultUserSettings.currency,
        timezone: defaultUserSettings.timezone,
        date_format: defaultUserSettings.dateFormat,
        notifications: defaultUserSettings.notifications,
        risk_management: defaultUserSettings.riskManagement,
        trading_hours: defaultUserSettings.tradingHours,
      });

    if (error) {
      console.error('Error creating default user settings:', error);
    } else {
      setUserSettingsState(defaultUserSettings);
    }
  };

  // CRUD operations
  const addTrade = async (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const dbTrade = transformTradeToDbTrade(trade, user.id);
    const { data, error } = await supabase
      .from('trades')
      .insert(dbTrade)
      .select()
      .single();

    if (error) {
      console.error('Error adding trade:', error);
      return;
    }

    const newTrade = transformDbTradeToTrade(data);
    setTrades(prev => {
      const newTrades = [newTrade, ...prev];
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: newTrades }));
      }, 0);
      return newTrades;
    });

    // Update portfolio balance if trade is closed
    if (!trade.isOpen && trade.pnl !== undefined) {
      await updatePortfolioBalance(trade.pnl - (trade.fees || 0));
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('trades')
      .update({
        date: updates.date,
        time: updates.time,
        asset: updates.asset,
        direction: updates.direction,
        entry_price: updates.entryPrice,
        exit_price: updates.exitPrice || null,
        position_size: updates.positionSize,
        strategy: updates.strategy,
        reasoning: updates.reasoning || null,
        market_conditions: updates.marketConditions || null,
        tags: updates.tags || null,
        is_open: updates.isOpen,
        pnl: updates.pnl || null,
        fees: updates.fees || null,
        emotional_state: updates.emotionalState || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating trade:', error);
      return;
    }

    setTrades(prev => {
      const newTrades = prev.map(trade => {
        if (trade.id === id) {
          const updatedTrade = { ...trade, ...updates };
          
          // If trade is being closed, update portfolio balance
          if (trade.isOpen && !updatedTrade.isOpen && updatedTrade.pnl !== undefined) {
            updatePortfolioBalance(updatedTrade.pnl - (updatedTrade.fees || 0));
          }
          
          return updatedTrade;
        }
        return trade;
      });
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: newTrades }));
      }, 0);
      
      return newTrades;
    });
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting trade:', error);
      return;
    }

    setTrades(prev => {
      const newTrades = prev.filter(trade => trade.id !== id);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: newTrades }));
      }, 0);
      return newTrades;
    });
  };

  const addAsset = async (asset: Omit<Asset, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const dbAsset = transformAssetToDbAsset(asset, user.id);
    const { data, error } = await supabase
      .from('assets')
      .insert(dbAsset)
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      return;
    }

    const newAsset = transformDbAssetToAsset(data);
    setAssets(prev => {
      const newAssets = [newAsset, ...prev];
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: newAssets }));
      }, 0);
      return newAssets;
    });
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('assets')
      .update({
        symbol: updates.symbol,
        name: updates.name,
        category: updates.category,
        exchange: updates.exchange || null,
        sector: updates.sector || null,
        is_active: updates.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating asset:', error);
      return;
    }

    setAssets(prev => {
      const newAssets = prev.map(asset => 
        asset.id === id ? { ...asset, ...updates } : asset
      );
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: newAssets }));
      }, 0);
      return newAssets;
    });
  };

  const deleteAsset = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting asset:', error);
      return;
    }

    setAssets(prev => {
      const newAssets = prev.filter(asset => asset.id !== id);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: newAssets }));
      }, 0);
      return newAssets;
    });
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const dbGoal = transformGoalToDbGoal(goal, user.id);
    const { data, error } = await supabase
      .from('goals')
      .insert(dbGoal)
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      return;
    }

    const newGoal = transformDbGoalToGoal(data);
    setGoals(prev => {
      const newGoals = [newGoal, ...prev];
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: newGoals }));
      }, 0);
      return newGoals;
    });
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('goals')
      .update({
        type: updates.type,
        target: updates.target,
        current: updates.current,
        deadline: updates.deadline,
        description: updates.description,
        is_active: updates.isActive,
        priority: updates.priority,
        category: updates.category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating goal:', error);
      return;
    }

    setGoals(prev => {
      const newGoals = prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      );
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: newGoals }));
      }, 0);
      return newGoals;
    });
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      return;
    }

    setGoals(prev => {
      const newGoals = prev.filter(goal => goal.id !== id);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: newGoals }));
      }, 0);
      return newGoals;
    });
  };

  const setPortfolio = async (portfolioOrUpdater: PortfolioSettings | ((prev: PortfolioSettings) => PortfolioSettings)) => {
    if (!user) return;
    
    const newPortfolio = typeof portfolioOrUpdater === 'function' 
      ? portfolioOrUpdater(portfolio) 
      : portfolioOrUpdater;
    
    const { error } = await supabase
      .from('portfolio_settings')
      .upsert({
        user_id: user.id,
        initial_capital: newPortfolio.initialCapital,
        current_balance: newPortfolio.currentBalance,
        max_daily_loss: newPortfolio.maxDailyLoss,
        max_daily_loss_percentage: newPortfolio.maxDailyLossPercentage,
        max_position_size: newPortfolio.maxPositionSize,
        max_position_size_percentage: newPortfolio.maxPositionSizePercentage,
        risk_reward_ratio: newPortfolio.riskRewardRatio,
        currency: newPortfolio.currency,
        timezone: newPortfolio.timezone,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating portfolio:', error);
      return;
    }

    setPortfolioState(newPortfolio);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: newPortfolio }));
    }, 0);
  };

  const updatePortfolioBalance = async (change: number) => {
    if (!user) return;
    
    const newBalance = portfolio.currentBalance + change;
    await setPortfolio(prev => ({ ...prev, currentBalance: newBalance }));
  };

  const setUserSettings = async (settingsOrUpdater: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    if (!user) return;
    
    const newSettings = typeof settingsOrUpdater === 'function' 
      ? settingsOrUpdater(userSettings) 
      : settingsOrUpdater;
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: newSettings.theme,
        currency: newSettings.currency,
        timezone: newSettings.timezone,
        date_format: newSettings.dateFormat,
        notifications: newSettings.notifications,
        risk_management: newSettings.riskManagement,
        trading_hours: newSettings.tradingHours,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating user settings:', error);
      return;
    }

    setUserSettingsState(newSettings);
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    // Journal entries functionality can be added later
    console.log('Journal entries not yet implemented');
  };

  const exportData = () => {
    const data = {
      trades,
      portfolio,
      goals,
      journalEntries,
      userSettings,
      assets,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string) => {
    // Import functionality would need to sync with Supabase
    console.log('Import functionality not yet implemented for cloud storage');
    return false;
  };

  return {
    trades,
    portfolio,
    goals,
    journalEntries,
    userSettings,
    assets,
    loading,
    setPortfolio,
    setUserSettings,
    addTrade,
    updateTrade,
    deleteTrade,
    addGoal,
    updateGoal,
    deleteGoal,
    addJournalEntry,
    addAsset,
    updateAsset,
    deleteAsset,
    exportData,
    importData,
  };
}