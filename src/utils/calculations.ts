import { Trade, Analytics, Goal, PortfolioSettings } from '../types';

export function calculatePnL(trade: Trade): number {
  if (!trade.exitPrice || trade.isOpen) return 0;
  
  const difference = trade.direction === 'long' 
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice;
  
  return (difference * trade.positionSize) - (trade.fees || 0);
}

export function calculateAnalytics(trades: Trade[]): Analytics {
  const closedTrades = trades.filter(t => !t.isOpen && t.exitPrice);
  
  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      bestDay: 0,
      worstDay: 0,
      avgHoldingTime: 0,
    };
  }

  const wins = closedTrades.filter(t => (t.pnl || calculatePnL(t)) > 0);
  const losses = closedTrades.filter(t => (t.pnl || calculatePnL(t)) < 0);
  
  const totalWins = wins.reduce((sum, t) => sum + (t.pnl || calculatePnL(t)), 0);
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || calculatePnL(t)), 0));
  
  const winRate = (wins.length / closedTrades.length) * 100;
  const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;

  // Group trades by day for daily P&L analysis
  const dailyPnL = new Map<string, number>();
  closedTrades.forEach(trade => {
    const date = trade.date;
    const pnl = trade.pnl || calculatePnL(trade);
    dailyPnL.set(date, (dailyPnL.get(date) || 0) + pnl);
  });

  const dailyReturns = Array.from(dailyPnL.values());
  const bestDay = Math.max(...dailyReturns, 0);
  const worstDay = Math.min(...dailyReturns, 0);

  // Calculate max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;
  
  closedTrades.forEach(trade => {
    runningPnL += trade.pnl || calculatePnL(trade);
    if (runningPnL > peak) peak = runningPnL;
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  // Calculate average holding time (in hours)
  const avgHoldingTime = closedTrades.reduce((sum, trade) => {
    const entryTime = new Date(`${trade.date} ${trade.time}`);
    const exitTime = new Date(); // Simplified - would need exit time in real app
    return sum + (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
  }, 0) / closedTrades.length;

  return {
    totalTrades: closedTrades.length,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    sharpeRatio: calculateSharpeRatio(dailyReturns),
    maxDrawdown,
    bestDay,
    worstDay,
    avgHoldingTime,
  };
}

function calculateSharpeRatio(returns: number[]): number {
  if (returns.length < 2) return 0;
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev > 0 ? avgReturn / stdDev : 0;
}

export function calculateGoalAnalytics(goal: Goal, trades: Trade[], portfolio: PortfolioSettings) {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const startDate = new Date(goal.createdAt);
  
  // Calculate time-based metrics
  const totalDays = Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate current progress based on goal type and category
  let current = 0;
  
  if (goal.category === 'profit') {
    // Calculate profit for the goal period
    const relevantTrades = getTradesForPeriod(trades, goal.type, startDate);
    current = relevantTrades.reduce((sum, trade) => {
      if (!trade.isOpen && trade.pnl !== undefined) {
        return sum + trade.pnl;
      }
      return sum;
    }, 0);
  } else if (goal.category === 'winrate') {
    const relevantTrades = getTradesForPeriod(trades, goal.type, startDate).filter(t => !t.isOpen);
    if (relevantTrades.length > 0) {
      const wins = relevantTrades.filter(t => (t.pnl || 0) > 0).length;
      current = (wins / relevantTrades.length) * 100;
    }
  } else if (goal.category === 'trades') {
    current = getTradesForPeriod(trades, goal.type, startDate).length;
  } else if (goal.category === 'drawdown') {
    // For drawdown, current represents the current drawdown (lower is better)
    const relevantTrades = getTradesForPeriod(trades, goal.type, startDate);
    current = calculateMaxDrawdownForTrades(relevantTrades);
  }
  
  // Calculate progress percentage
  const progress = goal.category === 'drawdown' 
    ? Math.max(0, (1 - current / goal.target) * 100) // For drawdown, less is better
    : (current / goal.target) * 100;
  
  // Calculate remaining amount
  const remaining = Math.max(0, goal.target - current);
  
  // Calculate growth rates
  const timeProgress = elapsedDays / totalDays;
  const expectedProgress = timeProgress * goal.target;
  const growthRate = timeProgress > 0 ? ((current - 0) / expectedProgress - 1) * 100 : 0;
  const averageGrowth = elapsedDays > 0 ? (current / elapsedDays) * (totalDays / goal.target) * 100 : 0;
  
  // Calculate required daily progress
  const requiredDailyProgress = daysRemaining > 0 ? remaining / daysRemaining : 0;
  
  // Performance rating
  const performanceRating = getPerformanceRating(progress, timeProgress * 100, growthRate);
  
  // Achievement probability
  const achievementProbability = calculateAchievementProbability(
    progress, 
    timeProgress * 100, 
    growthRate, 
    daysRemaining,
    goal.category
  );
  
  // Generate insights
  const insights = generateGoalInsights(goal, {
    progress,
    timeProgress: timeProgress * 100,
    growthRate,
    daysRemaining,
    requiredDailyProgress,
    current,
    remaining
  });
  
  return {
    current,
    progress,
    remaining,
    daysRemaining,
    growthRate,
    averageGrowth,
    requiredDailyProgress,
    performanceRating: performanceRating.rating,
    ratingDescription: performanceRating.description,
    achievementProbability,
    probabilityDescription: getProbabilityDescription(achievementProbability),
    insights
  };
}

function getTradesForPeriod(trades: Trade[], goalType: Goal['type'], startDate: Date): Trade[] {
  const now = new Date();
  let periodStart = new Date(startDate);
  
  switch (goalType) {
    case 'daily':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      periodStart = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
      break;
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      periodStart = new Date(now.getFullYear(), 0, 1);
      break;
  }
  
  return trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return tradeDate >= periodStart && tradeDate <= now;
  });
}

function calculateMaxDrawdownForTrades(trades: Trade[]): number {
  const closedTrades = trades.filter(t => !t.isOpen && t.exitPrice);
  if (closedTrades.length === 0) return 0;
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;
  
  closedTrades.forEach(trade => {
    runningPnL += trade.pnl || calculatePnL(trade);
    if (runningPnL > peak) peak = runningPnL;
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  
  return maxDrawdown;
}

function getPerformanceRating(progress: number, timeProgress: number, growthRate: number) {
  const progressRatio = progress / Math.max(timeProgress, 1);
  
  if (progressRatio >= 1.5 && growthRate > 20) {
    return { rating: 'excellent', description: 'Outstanding performance, well ahead of schedule' };
  } else if (progressRatio >= 1.2 && growthRate > 10) {
    return { rating: 'good', description: 'Good progress, ahead of target timeline' };
  } else if (progressRatio >= 0.8 && progressRatio < 1.2) {
    return { rating: 'average', description: 'On track, meeting expected progress' };
  } else if (progressRatio >= 0.5 && progressRatio < 0.8) {
    return { rating: 'poor', description: 'Behind schedule, needs improvement' };
  } else {
    return { rating: 'bad', description: 'Significantly behind, major changes needed' };
  }
}

function calculateAchievementProbability(
  progress: number, 
  timeProgress: number, 
  growthRate: number, 
  daysRemaining: number,
  category: Goal['category']
): number {
  let baseProbability = 50;
  
  // Adjust based on current progress vs time progress
  const progressRatio = progress / Math.max(timeProgress, 1);
  if (progressRatio >= 1.5) baseProbability += 30;
  else if (progressRatio >= 1.2) baseProbability += 20;
  else if (progressRatio >= 1.0) baseProbability += 10;
  else if (progressRatio >= 0.8) baseProbability -= 10;
  else if (progressRatio >= 0.5) baseProbability -= 20;
  else baseProbability -= 30;
  
  // Adjust based on growth rate
  if (growthRate > 20) baseProbability += 15;
  else if (growthRate > 10) baseProbability += 10;
  else if (growthRate > 0) baseProbability += 5;
  else if (growthRate > -10) baseProbability -= 5;
  else baseProbability -= 15;
  
  // Adjust based on time remaining
  if (daysRemaining > 30) baseProbability += 5;
  else if (daysRemaining < 7) baseProbability -= 10;
  
  // Category-specific adjustments
  if (category === 'winrate' && progress > 70) baseProbability += 10;
  if (category === 'profit' && growthRate > 15) baseProbability += 10;
  
  return Math.max(0, Math.min(100, baseProbability));
}

function getProbabilityDescription(probability: number): string {
  if (probability >= 80) return 'Very likely to achieve';
  if (probability >= 60) return 'Good chance of success';
  if (probability >= 40) return 'Moderate probability';
  if (probability >= 20) return 'Challenging but possible';
  return 'Requires significant improvement';
}

function generateGoalInsights(goal: Goal, metrics: any): string[] {
  const insights: string[] = [];
  
  if (metrics.progress > metrics.timeProgress * 1.2) {
    insights.push('Excellent pace! You\'re ahead of schedule and likely to exceed your target.');
  }
  
  if (metrics.growthRate < 0 && metrics.daysRemaining > 7) {
    insights.push('Consider reviewing your strategy as current growth rate is negative.');
  }
  
  if (metrics.daysRemaining < 7 && metrics.progress < 80) {
    insights.push('Time is running short. Focus on high-impact activities to reach your goal.');
  }
  
  if (goal.category === 'profit' && metrics.requiredDailyProgress > metrics.current / Math.max(1, metrics.daysRemaining)) {
    insights.push('Daily target has increased. Consider adjusting position sizes or strategy.');
  }
  
  if (metrics.progress > 90) {
    insights.push('You\'re very close to achieving this goal! Maintain current momentum.');
  }
  
  if (goal.category === 'winrate' && metrics.current < 50) {
    insights.push('Win rate below 50%. Review your entry and exit strategies.');
  }
  
  return insights;
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  // Always use INR formatting
  return formatIndianCurrency(amount, '₹');
}

function formatIndianCurrency(amount: number, symbol: string): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10000000) { // 1 crore
    const crores = (absAmount / 10000000).toFixed(2);
    return `${isNegative ? '-' : ''}${symbol}${crores}Cr`;
  } else if (absAmount >= 100000) { // 1 lakh
    const lakhs = (absAmount / 100000).toFixed(2);
    return `${isNegative ? '-' : ''}${symbol}${lakhs}L`;
  } else if (absAmount >= 1000) { // 1 thousand
    const thousands = (absAmount / 1000).toFixed(2);
    return `${isNegative ? '-' : ''}${symbol}${thousands}K`;
  } else {
    return `${isNegative ? '-' : ''}${symbol}${absAmount.toFixed(2)}`;
  }
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

// Generate consistency graph data (GitHub-style) with improved visibility
export function generateConsistencyData(trades: Trade[], startDate?: Date): Array<{
  date: string;
  pnl: number;
  level: number;
  trades: number;
}> {
  const endDate = new Date();
  const start = startDate || new Date(endDate.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year ago
  
  // Group trades by date
  const dailyData = new Map<string, { pnl: number; trades: number }>();
  
  // Initialize all dates with 0
  for (let d = new Date(start); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dailyData.set(dateStr, { pnl: 0, trades: 0 });
  }
  
  // Populate with actual trade data
  trades.filter(t => !t.isOpen && t.exitPrice && t.pnl !== undefined).forEach(trade => {
    const date = trade.date;
    const pnl = trade.pnl || calculatePnL(trade);
    const existing = dailyData.get(date) || { pnl: 0, trades: 0 };
    dailyData.set(date, {
      pnl: existing.pnl + pnl,
      trades: existing.trades + 1
    });
  });
  
  // Convert to array and calculate levels
  const dataArray = Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    pnl: data.pnl,
    trades: data.trades,
    level: calculateLevel(data.pnl, data.trades)
  }));
  
  return dataArray.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateLevel(pnl: number, trades: number): number {
  if (trades === 0) return 0; // No trades
  
  // Calculate level based on P&L amount with better thresholds for visibility (adjusted for ₹)
  if (pnl > 0) {
    // Profit levels (1-4, green shades) - adjusted for INR amounts
    if (pnl >= 500) return 4;   // Dark green - ₹500+
    if (pnl >= 200) return 3;   // Medium green - ₹200+
    if (pnl >= 50) return 2;    // Light green - ₹50+
    return 1;                   // Very light green - any profit
  } else if (pnl < 0) {
    // Loss levels (-1 to -4, red shades) - adjusted for INR amounts
    if (pnl <= -500) return -4; // Dark red - ₹500+ loss
    if (pnl <= -200) return -3; // Medium red - ₹200+ loss
    if (pnl <= -50) return -2;  // Light red - ₹50+ loss
    return -1;                  // Very light red - any loss
  }
  return 0; // Break-even
}