import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { Trade, PortfolioSettings, Goal, JournalEntry, UserSettings, Asset } from '../types';

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

// Helper functions to convert between Firestore and app data
const convertTimestampToString = (timestamp: any): string => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

const convertFirestoreToTrade = (doc: any): Trade => {
  const data = doc.data();
  return {
    id: doc.id,
    date: data.date,
    time: data.time,
    asset: data.asset,
    direction: data.direction,
    entryPrice: data.entryPrice,
    exitPrice: data.exitPrice,
    positionSize: data.positionSize,
    strategy: data.strategy,
    reasoning: data.reasoning || '',
    marketConditions: data.marketConditions || '',
    tags: data.tags || [],
    isOpen: data.isOpen,
    pnl: data.pnl,
    fees: data.fees,
    emotionalState: data.emotionalState || 'neutral',
    createdAt: convertTimestampToString(data.createdAt),
  };
};

const convertFirestoreToAsset = (doc: any): Asset => {
  const data = doc.data();
  return {
    id: doc.id,
    symbol: data.symbol,
    name: data.name,
    category: data.category,
    exchange: data.exchange,
    sector: data.sector,
    isActive: data.isActive,
    createdAt: convertTimestampToString(data.createdAt),
  };
};

const convertFirestoreToGoal = (doc: any): Goal => {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    target: data.target,
    current: data.current,
    deadline: data.deadline,
    description: data.description,
    isActive: data.isActive,
    priority: data.priority,
    category: data.category,
    createdAt: convertTimestampToString(data.createdAt),
  };
};

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
      setupRealtimeListeners();
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

  const setupRealtimeListeners = () => {
    if (!user) return;

    // Real-time trades listener
    const tradesQuery = query(
      collection(db, 'trades'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTrades = onSnapshot(tradesQuery, (snapshot) => {
      const tradesData = snapshot.docs.map(convertFirestoreToTrade);
      setTrades(tradesData);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: tradesData }));
      }, 0);
    });

    // Real-time assets listener
    const assetsQuery = query(
      collection(db, 'assets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeAssets = onSnapshot(assetsQuery, (snapshot) => {
      const assetsData = snapshot.docs.map(convertFirestoreToAsset);
      setAssets(assetsData);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: assetsData }));
      }, 0);
    });

    // Real-time goals listener
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData = snapshot.docs.map(convertFirestoreToGoal);
      setGoals(goalsData);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: goalsData }));
      }, 0);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeTrades();
      unsubscribeAssets();
      unsubscribeGoals();
    };
  };

  const loadTrades = async () => {
    if (!user) return;
    
    try {
      const tradesQuery = query(
        collection(db, 'trades'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(tradesQuery);
      const tradesData = snapshot.docs.map(convertFirestoreToTrade);
      setTrades(tradesData);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const loadAssets = async () => {
    if (!user) return;
    
    try {
      const assetsQuery = query(
        collection(db, 'assets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(assetsQuery);
      const assetsData = snapshot.docs.map(convertFirestoreToAsset);
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(goalsQuery);
      const goalsData = snapshot.docs.map(convertFirestoreToGoal);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadPortfolio = async () => {
    if (!user) return;
    
    try {
      const portfolioDoc = await getDoc(doc(db, 'portfolios', user.uid));
      
      if (portfolioDoc.exists()) {
        const data = portfolioDoc.data();
        setPortfolioState({
          ...data,
          deposits: data.deposits || [],
          withdrawals: data.withdrawals || [],
        } as PortfolioSettings);
      } else {
        // Create default portfolio if none exists
        await createDefaultPortfolio();
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setUserSettingsState(data as UserSettings);
      } else {
        // Create default settings if none exist
        await createDefaultUserSettings();
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const createDefaultPortfolio = async () => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'portfolios', user.uid), {
        ...defaultPortfolioSettings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setPortfolioState(defaultPortfolioSettings);
    } catch (error) {
      console.error('Error creating default portfolio:', error);
    }
  };

  const createDefaultUserSettings = async () => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'userSettings', user.uid), {
        ...defaultUserSettings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setUserSettingsState(defaultUserSettings);
    } catch (error) {
      console.error('Error creating default user settings:', error);
    }
  };

  // CRUD operations
  const addTrade = async (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const tradeData = {
        ...trade,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'trades'), tradeData);
      
      // Update portfolio balance if trade is closed
      if (!trade.isOpen && trade.pnl !== undefined) {
        await updatePortfolioBalance(trade.pnl - (trade.fees || 0));
      }
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (!user) return;
    
    try {
      const tradeRef = doc(db, 'trades', id);
      await updateDoc(tradeRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      
      // Update portfolio balance if trade is being closed
      const originalTrade = trades.find(t => t.id === id);
      if (originalTrade?.isOpen && !updates.isOpen && updates.pnl !== undefined) {
        await updatePortfolioBalance(updates.pnl - (updates.fees || 0));
      }
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'trades', id));
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const addAsset = async (asset: Omit<Asset, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const assetData = {
        ...asset,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'assets'), assetData);
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    if (!user) return;
    
    try {
      const assetRef = doc(db, 'assets', id);
      await updateDoc(assetRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'assets', id));
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const goalData = {
        ...goal,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'goals'), goalData);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    
    try {
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const setPortfolio = async (portfolioOrUpdater: PortfolioSettings | ((prev: PortfolioSettings) => PortfolioSettings)) => {
    if (!user) return;
    
    try {
      const newPortfolio = typeof portfolioOrUpdater === 'function' 
        ? portfolioOrUpdater(portfolio) 
        : portfolioOrUpdater;
      
      await setDoc(doc(db, 'portfolios', user.uid), {
        ...newPortfolio,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      
      setPortfolioState(newPortfolio);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: newPortfolio }));
      }, 0);
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  };

  const updatePortfolioBalance = async (change: number) => {
    if (!user) return;
    
    const newBalance = portfolio.currentBalance + change;
    await setPortfolio(prev => ({ ...prev, currentBalance: newBalance }));
  };

  const setUserSettings = async (settingsOrUpdater: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    if (!user) return;
    
    try {
      const newSettings = typeof settingsOrUpdater === 'function' 
        ? settingsOrUpdater(userSettings) 
        : settingsOrUpdater;
      
      await setDoc(doc(db, 'userSettings', user.uid), {
        ...newSettings,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      
      setUserSettingsState(newSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const entryData = {
        ...entry,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'journalEntries'), entryData);
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
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
    console.log('Import functionality not yet implemented for Firebase');
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