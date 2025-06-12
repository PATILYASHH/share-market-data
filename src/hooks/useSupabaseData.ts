import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Trade, PortfolioSettings, Goal, JournalEntry, UserSettings, Asset, Transaction } from '../types';

// Transform database row to application type
function transformTradeFromDB(row: any): Trade {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    asset: row.asset,
    direction: row.direction,
    entryPrice: parseFloat(row.entry_price),
    exitPrice: row.exit_price ? parseFloat(row.exit_price) : undefined,
    positionSize: parseFloat(row.position_size),
    strategy: row.strategy,
    reasoning: row.reasoning || '',
    marketConditions: row.market_conditions || '',
    tags: row.tags || [],
    screenshots: row.screenshots || [],
    isOpen: row.is_open,
    pnl: row.pnl ? parseFloat(row.pnl) : undefined,
    fees: parseFloat(row.fees) || 0,
    emotionalState: row.emotional_state || 'neutral',
    createdAt: row.created_at,
  };
}

function transformTradeForDB(trade: Omit<Trade, 'id' | 'createdAt'>): any {
  return {
    date: trade.date,
    time: trade.time,
    asset: trade.asset,
    direction: trade.direction,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice || null,
    position_size: trade.positionSize,
    strategy: trade.strategy,
    reasoning: trade.reasoning || '',
    market_conditions: trade.marketConditions || '',
    tags: trade.tags || [],
    screenshots: trade.screenshots || [],
    is_open: trade.isOpen,
    pnl: trade.pnl || null,
    fees: trade.fees || 0,
    emotional_state: trade.emotionalState || 'neutral',
  };
}

function transformAssetFromDB(row: any): Asset {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    category: row.category,
    exchange: row.exchange,
    sector: row.sector,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function transformAssetForDB(asset: Omit<Asset, 'id' | 'createdAt'>): any {
  return {
    symbol: asset.symbol,
    name: asset.name,
    category: asset.category,
    exchange: asset.exchange || null,
    sector: asset.sector || null,
    is_active: asset.isActive,
  };
}

function transformGoalFromDB(row: any): Goal {
  return {
    id: row.id,
    type: row.type,
    target: parseFloat(row.target),
    current: parseFloat(row.current_value),
    deadline: row.deadline,
    description: row.description,
    isActive: row.is_active,
    priority: row.priority,
    category: row.category,
    createdAt: row.created_at,
  };
}

function transformGoalForDB(goal: Omit<Goal, 'id' | 'createdAt'>): any {
  return {
    type: goal.type,
    target: goal.target,
    current_value: goal.current,
    deadline: goal.deadline,
    description: goal.description,
    is_active: goal.isActive,
    priority: goal.priority,
    category: goal.category,
  };
}

function transformPortfolioFromDB(row: any): PortfolioSettings {
  return {
    initialCapital: parseFloat(row.initial_capital),
    currentBalance: parseFloat(row.current_balance),
    maxDailyLoss: parseFloat(row.max_daily_loss),
    maxDailyLossPercentage: parseFloat(row.max_daily_loss_percentage),
    maxPositionSize: parseFloat(row.max_position_size),
    maxPositionSizePercentage: parseFloat(row.max_position_size_percentage),
    riskRewardRatio: parseFloat(row.risk_reward_ratio),
    currency: row.currency,
    timezone: row.timezone,
    deposits: [],
    withdrawals: [],
  };
}

export function useSupabaseData() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [portfolio, setPortfolioState] = useState<PortfolioSettings>({
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
  });
  const [userSettings, setUserSettingsState] = useState<UserSettings>({
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
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        tradesResult,
        assetsResult,
        goalsResult,
        portfolioResult,
        userSettingsResult,
        journalResult,
        transactionsResult,
      ] = await Promise.all([
        supabase.from('trades').select('*').order('created_at', { ascending: false }),
        supabase.from('assets').select('*').order('created_at', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('portfolio_settings').select('*').limit(1).single(),
        supabase.from('user_settings').select('*').limit(1).single(),
        supabase.from('journal_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      ]);

      // Handle trades
      if (tradesResult.error) throw tradesResult.error;
      setTrades(tradesResult.data?.map(transformTradeFromDB) || []);

      // Handle assets
      if (assetsResult.error) throw assetsResult.error;
      setAssets(assetsResult.data?.map(transformAssetFromDB) || []);

      // Handle goals
      if (goalsResult.error) throw goalsResult.error;
      setGoals(goalsResult.data?.map(transformGoalFromDB) || []);

      // Handle portfolio settings
      if (portfolioResult.data) {
        const portfolioData = transformPortfolioFromDB(portfolioResult.data);
        
        // Load transactions
        if (transactionsResult.data) {
          const deposits: Transaction[] = [];
          const withdrawals: Transaction[] = [];
          
          transactionsResult.data.forEach((tx: any) => {
            const transaction: Transaction = {
              id: tx.id,
              date: tx.date,
              amount: parseFloat(tx.amount),
              type: tx.type,
              description: tx.description,
            };
            
            if (tx.type === 'deposit') {
              deposits.push(transaction);
            } else {
              withdrawals.push(transaction);
            }
          });
          
          portfolioData.deposits = deposits;
          portfolioData.withdrawals = withdrawals;
        }
        
        setPortfolioState(portfolioData);
      }

      // Handle user settings
      if (userSettingsResult.data) {
        const settings: UserSettings = {
          theme: userSettingsResult.data.theme || 'light',
          currency: userSettingsResult.data.currency || 'USD',
          timezone: userSettingsResult.data.timezone || 'America/New_York',
          dateFormat: userSettingsResult.data.date_format || 'MM/DD/YYYY',
          notifications: userSettingsResult.data.notifications || {
            dailyLossLimit: true,
            goalProgress: true,
            tradeReminders: false,
          },
          riskManagement: userSettingsResult.data.risk_management || {
            maxDailyLoss: 500,
            maxDailyLossPercentage: 5,
            maxPositionSize: 1000,
            maxPositionSizePercentage: 10,
            riskRewardRatio: 2,
            stopLossRequired: false,
            takeProfitRequired: false,
          },
          tradingHours: userSettingsResult.data.trading_hours || {
            start: '09:30',
            end: '16:00',
            timezone: 'America/New_York',
          },
        };
        setUserSettingsState(settings);
      }

      // Handle journal entries
      if (journalResult.error) throw journalResult.error;
      setJournalEntries(journalResult.data?.map((row: any) => ({
        id: row.id,
        date: row.date,
        title: row.title,
        content: row.content,
        mood: row.mood,
        tags: row.tags || [],
        createdAt: row.created_at,
      })) || []);

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trade operations
  const addTrade = useCallback(async (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([transformTradeForDB(trade)])
        .select()
        .single();

      if (error) throw error;

      const newTrade = transformTradeFromDB(data);
      setTrades(prev => [newTrade, ...prev]);

      // Update portfolio balance if trade is closed
      if (!trade.isOpen && trade.pnl !== undefined) {
        await updatePortfolioBalance(trade.pnl - (trade.fees || 0));
      }

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: [newTrade] }));
      }, 0);

      return newTrade;
    } catch (err: any) {
      console.error('Error adding trade:', err);
      throw err;
    }
  }, []);

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .update({
          ...updates.date && { date: updates.date },
          ...updates.time && { time: updates.time },
          ...updates.asset && { asset: updates.asset },
          ...updates.direction && { direction: updates.direction },
          ...updates.entryPrice && { entry_price: updates.entryPrice },
          ...updates.exitPrice !== undefined && { exit_price: updates.exitPrice },
          ...updates.positionSize && { position_size: updates.positionSize },
          ...updates.strategy && { strategy: updates.strategy },
          ...updates.reasoning !== undefined && { reasoning: updates.reasoning },
          ...updates.marketConditions !== undefined && { market_conditions: updates.marketConditions },
          ...updates.tags && { tags: updates.tags },
          ...updates.screenshots && { screenshots: updates.screenshots },
          ...updates.isOpen !== undefined && { is_open: updates.isOpen },
          ...updates.pnl !== undefined && { pnl: updates.pnl },
          ...updates.fees !== undefined && { fees: updates.fees },
          ...updates.emotionalState && { emotional_state: updates.emotionalState },
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTrade = transformTradeFromDB(data);
      setTrades(prev => prev.map(trade => trade.id === id ? updatedTrade : trade));

      // Update portfolio balance if trade was closed
      const originalTrade = trades.find(t => t.id === id);
      if (originalTrade?.isOpen && !updatedTrade.isOpen && updatedTrade.pnl !== undefined) {
        await updatePortfolioBalance(updatedTrade.pnl - (updatedTrade.fees || 0));
      }

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: trades }));
      }, 0);

      return updatedTrade;
    } catch (err: any) {
      console.error('Error updating trade:', err);
      throw err;
    }
  }, [trades]);

  const deleteTrade = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrades(prev => prev.filter(trade => trade.id !== id));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: trades.filter(t => t.id !== id) }));
      }, 0);
    } catch (err: any) {
      console.error('Error deleting trade:', err);
      throw err;
    }
  }, [trades]);

  // Asset operations
  const addAsset = useCallback(async (asset: Omit<Asset, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([transformAssetForDB(asset)])
        .select()
        .single();

      if (error) throw error;

      const newAsset = transformAssetFromDB(data);
      setAssets(prev => [newAsset, ...prev]);

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: [newAsset] }));
      }, 0);

      return newAsset;
    } catch (err: any) {
      console.error('Error adding asset:', err);
      throw err;
    }
  }, []);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update({
          ...updates.symbol && { symbol: updates.symbol },
          ...updates.name && { name: updates.name },
          ...updates.category && { category: updates.category },
          ...updates.exchange !== undefined && { exchange: updates.exchange },
          ...updates.sector !== undefined && { sector: updates.sector },
          ...updates.isActive !== undefined && { is_active: updates.isActive },
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedAsset = transformAssetFromDB(data);
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: assets }));
      }, 0);

      return updatedAsset;
    } catch (err: any) {
      console.error('Error updating asset:', err);
      throw err;
    }
  }, [assets]);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssets(prev => prev.filter(asset => asset.id !== id));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: assets.filter(a => a.id !== id) }));
      }, 0);
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  }, [assets]);

  // Goal operations
  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([transformGoalForDB(goal)])
        .select()
        .single();

      if (error) throw error;

      const newGoal = transformGoalFromDB(data);
      setGoals(prev => [newGoal, ...prev]);

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: [newGoal] }));
      }, 0);

      return newGoal;
    } catch (err: any) {
      console.error('Error adding goal:', err);
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          ...updates.type && { type: updates.type },
          ...updates.target !== undefined && { target: updates.target },
          ...updates.current !== undefined && { current_value: updates.current },
          ...updates.deadline && { deadline: updates.deadline },
          ...updates.description && { description: updates.description },
          ...updates.isActive !== undefined && { is_active: updates.isActive },
          ...updates.priority && { priority: updates.priority },
          ...updates.category && { category: updates.category },
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedGoal = transformGoalFromDB(data);
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: goals }));
      }, 0);

      return updatedGoal;
    } catch (err: any) {
      console.error('Error updating goal:', err);
      throw err;
    }
  }, [goals]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: goals.filter(g => g.id !== id) }));
      }, 0);
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      throw err;
    }
  }, [goals]);

  // Portfolio operations
  const setPortfolio = useCallback(async (updates: Partial<PortfolioSettings> | ((prev: PortfolioSettings) => PortfolioSettings)) => {
    try {
      const newPortfolio = typeof updates === 'function' ? updates(portfolio) : { ...portfolio, ...updates };
      
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000', // Use a fixed UUID for single row
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

      if (error) throw error;

      // Handle transactions separately
      if (newPortfolio.deposits.length !== portfolio.deposits.length) {
        const newDeposits = newPortfolio.deposits.slice(portfolio.deposits.length);
        for (const deposit of newDeposits) {
          await supabase.from('transactions').insert({
            date: deposit.date,
            amount: deposit.amount,
            type: 'deposit',
            description: deposit.description,
          });
        }
      }

      if (newPortfolio.withdrawals.length !== portfolio.withdrawals.length) {
        const newWithdrawals = newPortfolio.withdrawals.slice(portfolio.withdrawals.length);
        for (const withdrawal of newWithdrawals) {
          await supabase.from('transactions').insert({
            date: withdrawal.date,
            amount: withdrawal.amount,
            type: 'withdrawal',
            description: withdrawal.description,
          });
        }
      }

      setPortfolioState(newPortfolio);

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: newPortfolio }));
      }, 0);
    } catch (err: any) {
      console.error('Error updating portfolio:', err);
      throw err;
    }
  }, [portfolio]);

  const updatePortfolioBalance = useCallback(async (pnlChange: number) => {
    try {
      const newBalance = portfolio.currentBalance + pnlChange;
      
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000',
          initial_capital: portfolio.initialCapital,
          current_balance: newBalance,
          max_daily_loss: portfolio.maxDailyLoss,
          max_daily_loss_percentage: portfolio.maxDailyLossPercentage,
          max_position_size: portfolio.maxPositionSize,
          max_position_size_percentage: portfolio.maxPositionSizePercentage,
          risk_reward_ratio: portfolio.riskRewardRatio,
          currency: portfolio.currency,
          timezone: portfolio.timezone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setPortfolioState(prev => ({ ...prev, currentBalance: newBalance }));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: { ...portfolio, currentBalance: newBalance } }));
      }, 0);
    } catch (err: any) {
      console.error('Error updating portfolio balance:', err);
      throw err;
    }
  }, [portfolio]);

  // User settings operations
  const setUserSettings = useCallback(async (updates: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => {
    try {
      const newSettings = typeof updates === 'function' ? updates(userSettings) : { ...userSettings, ...updates };
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000', // Use a fixed UUID for single row
          theme: newSettings.theme,
          currency: newSettings.currency,
          timezone: newSettings.timezone,
          date_format: newSettings.dateFormat,
          notifications: newSettings.notifications,
          risk_management: newSettings.riskManagement,
          trading_hours: newSettings.tradingHours,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setUserSettingsState(newSettings);
    } catch (err: any) {
      console.error('Error updating user settings:', err);
      throw err;
    }
  }, [userSettings]);

  // Journal operations
  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          date: entry.date,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
        }])
        .select()
        .single();

      if (error) throw error;

      const newEntry: JournalEntry = {
        id: data.id,
        date: data.date,
        title: data.title,
        content: data.content,
        mood: data.mood,
        tags: data.tags || [],
        createdAt: data.created_at,
      };

      setJournalEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err: any) {
      console.error('Error adding journal entry:', err);
      throw err;
    }
  }, []);

  // Export/Import operations
  const exportData = useCallback(() => {
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
  }, [trades, portfolio, goals, journalEntries, userSettings, assets]);

  const importData = useCallback(async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data and import new data
      // Note: This is a simplified import - in production you might want more sophisticated merging
      if (data.trades) {
        // Clear existing trades
        await supabase.from('trades').delete().neq('id', '');
        
        // Insert new trades
        for (const trade of data.trades) {
          await addTrade(trade);
        }
      }
      
      if (data.assets) {
        // Clear existing assets
        await supabase.from('assets').delete().neq('id', '');
        
        // Insert new assets
        for (const asset of data.assets) {
          await addAsset(asset);
        }
      }
      
      if (data.goals) {
        // Clear existing goals
        await supabase.from('goals').delete().neq('id', '');
        
        // Insert new goals
        for (const goal of data.goals) {
          await addGoal(goal);
        }
      }
      
      if (data.portfolio) {
        await setPortfolio(data.portfolio);
      }
      
      if (data.userSettings) {
        await setUserSettings(data.userSettings);
      }
      
      // Reload all data
      await loadAllData();
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }, [addTrade, addAsset, addGoal, setPortfolio, setUserSettings]);

  return {
    // Data
    trades,
    assets,
    goals,
    portfolio,
    userSettings,
    journalEntries,
    loading,
    error,
    
    // Trade operations
    addTrade,
    updateTrade,
    deleteTrade,
    
    // Asset operations
    addAsset,
    updateAsset,
    deleteAsset,
    
    // Goal operations
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Portfolio operations
    setPortfolio,
    
    // Settings operations
    setUserSettings,
    
    // Journal operations
    addJournalEntry,
    
    // Utility operations
    exportData,
    importData,
    refreshData: loadAllData,
  };
}