import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  Calendar,
  Clock,
  Award,
  Activity,
  Zap
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ConsistencyGraph } from './ConsistencyGraph';
import { PnLChart } from './PnLChart';
import { OpenTrades } from './OpenTrades';
import { useTradingData } from '../../hooks/useTradingData';
import { calculateAnalytics, formatCurrency, formatPercent, calculateGoalAnalytics, calculatePnL } from '../../utils/calculations';

export function Dashboard() {
  const { trades, portfolio, goals } = useTradingData();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh when data changes
  useEffect(() => {
    const handleDataUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Listen for data update events
    window.addEventListener('tradesUpdated', handleDataUpdate);
    window.addEventListener('portfolioUpdated', handleDataUpdate);
    window.addEventListener('goalsUpdated', handleDataUpdate);
    window.addEventListener('assetsUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('tradesUpdated', handleDataUpdate);
      window.removeEventListener('portfolioUpdated', handleDataUpdate);
      window.removeEventListener('goalsUpdated', handleDataUpdate);
      window.removeEventListener('assetsUpdated', handleDataUpdate);
    };
  }, []);

  const analytics = calculateAnalytics(trades);
  
  // Calculate total P&L from closed trades
  const closedTrades = trades.filter(t => !t.isOpen && t.exitPrice);
  const totalTradePnL = closedTrades.reduce((sum, trade) => {
    const pnl = trade.pnl !== undefined ? trade.pnl : calculatePnL(trade);
    return sum + pnl;
  }, 0);
  
  // Calculate total return percentage
  const totalReturn = portfolio.initialCapital > 0 
    ? ((portfolio.currentBalance - portfolio.initialCapital) / portfolio.initialCapital) * 100 
    : 0;
  
  const activeGoals = goals.filter(g => g.isActive);
  const monthlyGoal = activeGoals.find(g => g.type === 'monthly');
  
  const openTrades = trades.filter(t => t.isOpen);
  const recentTrades = trades.filter(t => !t.isOpen).slice(0, 5);

  // Calculate today's performance
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.date === today && !t.isOpen);
  const todayPnL = todayTrades.reduce((sum, trade) => {
    const pnl = trade.pnl !== undefined ? trade.pnl : calculatePnL(trade);
    return sum + pnl;
  }, 0);

  // Calculate this week's performance
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekTrades = trades.filter(t => t.date >= weekStartStr && !t.isOpen);
  const weekPnL = weekTrades.reduce((sum, trade) => {
    const pnl = trade.pnl !== undefined ? trade.pnl : calculatePnL(trade);
    return sum + pnl;
  }, 0);

  // Calculate best trade
  const bestTrade = closedTrades.length > 0 
    ? Math.max(...closedTrades.map(t => t.pnl !== undefined ? t.pnl : calculatePnL(t))) 
    : 0;

  return (
    <div className="space-y-8" key={refreshKey}>
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome back! Here's your trading performance overview
        </p>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(portfolio.currentBalance, portfolio.currency)}
          change={`${totalReturn >= 0 ? '+' : ''}${formatPercent(totalReturn)}`}
          changeType={totalReturn >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          description="Total account value"
        />
        
        <MetricCard
          title="Total P&L"
          value={formatCurrency(totalTradePnL, portfolio.currency)}
          change={`${closedTrades.length} closed trades`}
          changeType={totalTradePnL >= 0 ? 'positive' : 'negative'}
          icon={totalTradePnL >= 0 ? TrendingUp : TrendingDown}
          description="All-time profit/loss"
        />
        
        <MetricCard
          title="Win Rate"
          value={`${analytics.winRate.toFixed(1)}%`}
          change={`${analytics.totalTrades} closed trades`}
          changeType={analytics.winRate >= 60 ? 'positive' : analytics.winRate >= 50 ? 'neutral' : 'negative'}
          icon={Target}
          description="Success rate"
        />
        
        <MetricCard
          title="Open Positions"
          value={openTrades.length.toString()}
          change={openTrades.length > 0 ? 'Active trading' : 'No open positions'}
          changeType={openTrades.length > 0 ? 'neutral' : 'positive'}
          icon={Clock}
          description="Current positions"
        />
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's P&L"
          value={formatCurrency(todayPnL, portfolio.currency)}
          change={`${todayTrades.length} trades today`}
          changeType={todayPnL >= 0 ? 'positive' : 'negative'}
          icon={Activity}
          description="Today's performance"
        />
        
        <MetricCard
          title="This Week"
          value={formatCurrency(weekPnL, portfolio.currency)}
          change={`${weekTrades.length} trades this week`}
          changeType={weekPnL >= 0 ? 'positive' : 'negative'}
          icon={Calendar}
          description="Weekly performance"
        />
        
        <MetricCard
          title="Profit Factor"
          value={analytics.profitFactor.toFixed(2)}
          change={analytics.profitFactor >= 1.5 ? 'Excellent' : analytics.profitFactor >= 1 ? 'Good' : 'Needs work'}
          changeType={analytics.profitFactor >= 1.5 ? 'positive' : analytics.profitFactor >= 1 ? 'neutral' : 'negative'}
          icon={BarChart3}
          description="Risk-reward efficiency"
        />
        
        <MetricCard
          title="Best Trade"
          value={formatCurrency(bestTrade, portfolio.currency)}
          icon={Award}
          description="Largest winning trade"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PnLChart key={`pnl-${refreshKey}`} />
        <OpenTrades key={`open-${refreshKey}`} />
      </div>

      {/* Monthly Goal Progress */}
      {monthlyGoal && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 shadow-sm rounded-xl border border-blue-200">
          <div className="px-6 py-4 border-b border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Goal Progress</h3>
                <p className="text-sm text-gray-600">{monthlyGoal.description}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            {(() => {
              const goalAnalytics = calculateGoalAnalytics(monthlyGoal, trades, portfolio);
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-lg font-bold text-gray-900">
                      {monthlyGoal.category === 'profit' 
                        ? formatCurrency(goalAnalytics.current, portfolio.currency)
                        : goalAnalytics.current.toFixed(1)
                      }
                      {' / '}
                      {monthlyGoal.category === 'profit' 
                        ? formatCurrency(monthlyGoal.target, portfolio.currency)
                        : monthlyGoal.target
                      }
                      {monthlyGoal.category === 'winrate' && '%'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-white rounded-full h-4 shadow-inner">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${
                        goalAnalytics.progress >= 100 ? 'bg-green-500' : 
                        goalAnalytics.progress >= 75 ? 'bg-blue-500' : 
                        goalAnalytics.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(goalAnalytics.progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{goalAnalytics.progress.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">Complete</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{goalAnalytics.daysRemaining}</div>
                      <div className="text-xs text-gray-600">Days Left</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{goalAnalytics.achievementProbability.toFixed(0)}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Trading Consistency */}
      <ConsistencyGraph key={`consistency-${refreshKey}`} />

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trading Activity</h3>
        </div>
        <div className="px-6 py-4">
          {recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No closed trades yet</h3>
              <p className="mt-1 text-sm text-gray-500">Your recent trading activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => {
                const pnl = trade.pnl !== undefined ? trade.pnl : calculatePnL(trade);
                return (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        trade.direction === 'long' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{trade.asset}</div>
                        <div className="text-sm text-gray-500">
                          {trade.direction.toUpperCase()} • {trade.strategy} • {new Date(trade.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, portfolio.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trade.positionSize.toLocaleString()} units
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalTrades}</div>
            <div className="text-sm text-gray-600">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.avgWin, portfolio.currency)}
            </div>
            <div className="text-sm text-gray-600">Avg Win</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.avgLoss, portfolio.currency)}
            </div>
            <div className="text-sm text-gray-600">Avg Loss</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(analytics.maxDrawdown, portfolio.currency)}
            </div>
            <div className="text-sm text-gray-600">Max Drawdown</div>
          </div>
        </div>
      </div>
    </div>
  );
}