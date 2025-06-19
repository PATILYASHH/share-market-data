import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Trade, PortfolioSettings, Goal, JournalEntry, UserSettings, Asset, Transaction } from '../types';

// User ID for the specific user
const USER_ID = 'pasham@yash.com';

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
    user_id: USER_ID,
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
    user_id: USER_ID,
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
    user_id: USER_ID,
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
    currency: 'INR', // Always INR
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
    initialCapital: 2000, // ₹2,000 default for Indian users
    currentBalance: 2000,
    maxDailyLoss: 100, // ₹100 default (5% of ₹2,000)
    maxDailyLossPercentage: 5,
    maxPositionSize: 200, // ₹200 default (10% of ₹2,000)
    maxPositionSizePercentage: 10,
    riskRewardRatio: 2,
    currency: 'INR', // Always INR
    timezone: 'Asia/Kolkata', // Indian timezone
    deposits: [],
    withdrawals: [],
  });
  const [userSettings, setUserSettingsState] = useState<UserSettings>({
    theme: 'light',
    currency: 'INR', // Always INR
    timezone: 'Asia/Kolkata', // Indian timezone
    dateFormat: 'DD/MM/YYYY', // Indian date format
    notifications: {
      dailyLossLimit: true,
      goalProgress: true,
      tradeReminders: false,
    },
    riskManagement: {
      maxDailyLoss: 100, // ₹100 default
      maxDailyLossPercentage: 5,
      maxPositionSize: 200, // ₹200 default
      maxPositionSizePercentage: 10,
      riskRewardRatio: 2,
      stopLossRequired: false,
      takeProfitRequired: false,
    },
    tradingHours: {
      start: '09:15', // Indian market opening time
      end: '15:30',   // Indian market closing time
      timezone: 'Asia/Kolkata',
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

      // Load all data in parallel for the specific user
      const [
        tradesResult,
        assetsResult,
        goalsResult,
        portfolioResult,
        userSettingsResult,
        journalResult,
        transactionsResult,
      ] = await Promise.all([
        supabase.from('trades').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false }),
        supabase.from('assets').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false }),
        supabase.from('portfolio_settings').select('*').eq('user_id', USER_ID).limit(1).single(),
        supabase.from('user_settings').select('*').eq('user_id', USER_ID).limit(1).single(),
        supabase.from('journal_entries').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false }),
      ]);

      // Handle trades
      if (tradesResult.error && tradesResult.error.code !== 'PGRST116') throw tradesResult.error;
      const transformedTrades = tradesResult.data?.map(transformTradeFromDB) || [];
      setTrades(transformedTrades);

      // Handle assets
      if (assetsResult.error && assetsResult.error.code !== 'PGRST116') throw assetsResult.error;
      setAssets(assetsResult.data?.map(transformAssetFromDB) || []);

      // Handle goals
      if (goalsResult.error && goalsResult.error.code !== 'PGRST116') throw goalsResult.error;
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
        
        // Calculate current balance based on trades P&L
        const totalTradePnL = transformedTrades
          .filter(t => !t.isOpen && t.pnl !== undefined)
          .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        
        const totalDeposits = portfolioData.deposits.reduce((sum, d) => sum + d.amount, 0);
        const totalWithdrawals = portfolioData.withdrawals.reduce((sum, w) => sum + w.amount, 0);
        
        // Update current balance: initial + deposits - withdrawals + trade P&L
        portfolioData.currentBalance = portfolioData.initialCapital + totalDeposits - totalWithdrawals + totalTradePnL;
        
        setPortfolioState(portfolioData);
      } else {
        // Create default portfolio settings for new user
        await createDefaultPortfolioSettings();
      }

      // Handle user settings
      if (userSettingsResult.data) {
        const settings: UserSettings = {
          theme: userSettingsResult.data.theme || 'light',
          currency: 'INR', // Always INR
          timezone: userSettingsResult.data.timezone || 'Asia/Kolkata',
          dateFormat: userSettingsResult.data.date_format || 'DD/MM/YYYY',
          notifications: userSettingsResult.data.notifications || {
            dailyLossLimit: true,
            goalProgress: true,
            tradeReminders: false,
          },
          riskManagement: userSettingsResult.data.risk_management || {
            maxDailyLoss: 100,
            maxDailyLossPercentage: 5,
            maxPositionSize: 200,
            maxPositionSizePercentage: 10,
            riskRewardRatio: 2,
            stopLossRequired: false,
            takeProfitRequired: false,
          },
          tradingHours: userSettingsResult.data.trading_hours || {
            start: '09:15',
            end: '15:30',
            timezone: 'Asia/Kolkata',
          },
        };
        setUserSettingsState(settings);
      } else {
        // Create default user settings for new user
        await createDefaultUserSettings();
      }

      // Handle journal entries
      if (journalResult.error && journalResult.error.code !== 'PGRST116') throw journalResult.error;
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

  const createDefaultPortfolioSettings = async () => {
    try {
      const { error } = await supabase
        .from('portfolio_settings')
        .insert({
          user_id: USER_ID,
          initial_capital: 2000, // ₹2,000
          current_balance: 2000,
          max_daily_loss: 100, // ₹100
          max_daily_loss_percentage: 5,
          max_position_size: 200, // ₹200
          max_position_size_percentage: 10,
          risk_reward_ratio: 2,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error creating default portfolio settings:', err);
    }
  };

  const createDefaultUserSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: USER_ID,
          theme: 'light',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          date_format: 'DD/MM/YYYY',
          notifications: {
            dailyLossLimit: true,
            goalProgress: true,
            tradeReminders: false,
          },
          risk_management: {
            maxDailyLoss: 100,
            maxDailyLossPercentage: 5,
            maxPositionSize: 200,
            maxPositionSizePercentage: 10,
            riskRewardRatio: 2,
            stopLossRequired: false,
            takeProfitRequired: false,
          },
          trading_hours: {
            start: '09:15',
            end: '15:30',
            timezone: 'Asia/Kolkata',
          },
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error creating default user settings:', err);
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
      const updateData: any = {};
      
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.time !== undefined) updateData.time = updates.time;
      if (updates.asset !== undefined) updateData.asset = updates.asset;
      if (updates.direction !== undefined) updateData.direction = updates.direction;
      if (updates.entryPrice !== undefined) updateData.entry_price = updates.entryPrice;
      if (updates.exitPrice !== undefined) updateData.exit_price = updates.exitPrice;
      if (updates.positionSize !== undefined) updateData.position_size = updates.positionSize;
      if (updates.strategy !== undefined) updateData.strategy = updates.strategy;
      if (updates.reasoning !== undefined) updateData.reasoning = updates.reasoning;
      if (updates.marketConditions !== undefined) updateData.market_conditions = updates.marketConditions;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.screenshots !== undefined) updateData.screenshots = updates.screenshots;
      if (updates.isOpen !== undefined) updateData.is_open = updates.isOpen;
      if (updates.pnl !== undefined) updateData.pnl = updates.pnl;
      if (updates.fees !== undefined) updateData.fees = updates.fees;
      if (updates.emotionalState !== undefined) updateData.emotional_state = updates.emotionalState;

      const { data, error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', USER_ID)
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
        .eq('id', id)
        .eq('user_id', USER_ID);

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
      const updateData: any = {};
      
      if (updates.symbol !== undefined) updateData.symbol = updates.symbol;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.exchange !== undefined) updateData.exchange = updates.exchange;
      if (updates.sector !== undefined) updateData.sector = updates.sector;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', USER_ID)
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
        .eq('id', id)
        .eq('user_id', USER_ID);

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
      const updateData: any = {};
      
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.target !== undefined) updateData.target = updates.target;
      if (updates.current !== undefined) updateData.current_value = updates.current;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', USER_ID)
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
        .eq('id', id)
        .eq('user_id', USER_ID);

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
      
      // Always ensure currency is INR
      newPortfolio.currency = 'INR';
      
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert({
          user_id: USER_ID,
          initial_capital: newPortfolio.initialCapital,
          current_balance: newPortfolio.currentBalance,
          max_daily_loss: newPortfolio.maxDailyLoss,
          max_daily_loss_percentage: newPortfolio.maxDailyLossPercentage,
          max_position_size: newPortfolio.maxPositionSize || 200,
          max_position_size_percentage: newPortfolio.maxPositionSizePercentage || 10,
          risk_reward_ratio: newPortfolio.riskRewardRatio || 2,
          currency: 'INR', // Always INR
          timezone: newPortfolio.timezone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Handle transactions separately
      if (newPortfolio.deposits.length !== portfolio.deposits.length) {
        const newDeposits = newPortfolio.deposits.slice(portfolio.deposits.length);
        for (const deposit of newDeposits) {
          await supabase.from('transactions').insert({
            user_id: USER_ID,
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
            user_id: USER_ID,
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
          user_id: USER_ID,
          initial_capital: portfolio.initialCapital,
          current_balance: newBalance,
          max_daily_loss: portfolio.maxDailyLoss,
          max_daily_loss_percentage: portfolio.maxDailyLossPercentage,
          max_position_size: portfolio.maxPositionSize || 200,
          max_position_size_percentage: portfolio.maxPositionSizePercentage || 10,
          risk_reward_ratio: portfolio.riskRewardRatio || 2,
          currency: 'INR', // Always INR
          timezone: portfolio.timezone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setPortfolioState(prev => ({ ...prev, currentBalance: newBalance, currency: 'INR' }));

      // Trigger update events
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: { ...portfolio, currentBalance: newBalance, currency: 'INR' } }));
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
      
      // Always ensure currency is INR
      newSettings.currency = 'INR';
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: USER_ID,
          theme: newSettings.theme,
          currency: 'INR', // Always INR
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
          user_id: USER_ID,
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
      userId: USER_ID,
    };
    return JSON.stringify(data, null, 2);
  }, [trades, portfolio, goals, journalEntries, userSettings, assets]);

  const importData = useCallback(async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data and import new data for the user
      if (data.trades) {
        // Clear existing trades
        await supabase.from('trades').delete().eq('user_id', USER_ID);
        
        // Insert new trades
        for (const trade of data.trades) {
          await addTrade(trade);
        }
      }
      
      if (data.assets) {
        // Clear existing assets
        await supabase.from('assets').delete().eq('user_id', USER_ID);
        
        // Insert new assets
        for (const asset of data.assets) {
          await addAsset(asset);
        }
      }
      
      if (data.goals) {
        // Clear existing goals
        await supabase.from('goals').delete().eq('user_id', USER_ID);
        
        // Insert new goals
        for (const goal of data.goals) {
          await addGoal(goal);
        }
      }
      
      if (data.portfolio) {
        // Ensure currency is INR
        data.portfolio.currency = 'INR';
        await setPortfolio(data.portfolio);
      }
      
      if (data.userSettings) {
        // Ensure currency is INR
        data.userSettings.currency = 'INR';
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