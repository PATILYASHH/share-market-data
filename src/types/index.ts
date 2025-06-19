export interface Trade {
  id: string;
  date: string;
  time: string;
  asset: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  positionSize: number;
  strategy: string;
  reasoning: string;
  marketConditions: string;
  tags: string[];
  screenshots?: string[];
  isOpen: boolean;
  pnl?: number;
  fees?: number;
  emotionalState?: 'confident' | 'nervous' | 'neutral' | 'excited' | 'frustrated';
  createdAt: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices' | 'options';
  exchange?: string;
  sector?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PortfolioSettings {
  initialCapital: number;
  currentBalance: number;
  maxDailyLoss: number;
  maxDailyLossPercentage: number;
  maxPositionSize: number;
  maxPositionSizePercentage: number;
  riskRewardRatio: number;
  currency: 'INR'; // Only INR allowed
  timezone: string;
  deposits: Transaction[];
  withdrawals: Transaction[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description?: string;
}

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target: number;
  current: number;
  deadline: string;
  description: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'profit' | 'winrate' | 'trades' | 'drawdown';
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: 'INR'; // Only INR allowed
  timezone: string;
  dateFormat: string;
  notifications: {
    dailyLossLimit: boolean;
    goalProgress: boolean;
    tradeReminders: boolean;
  };
  riskManagement: {
    maxDailyLoss: number;
    maxDailyLossPercentage: number;
    maxPositionSize: number;
    maxPositionSizePercentage: number;
    riskRewardRatio: number;
    stopLossRequired: boolean;
    takeProfitRequired: boolean;
  };
  tradingHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'positive' | 'negative' | 'neutral';
  tags: string[];
  createdAt: string;
}

export interface Analytics {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestDay: number;
  worstDay: number;
  avgHoldingTime: number;
}