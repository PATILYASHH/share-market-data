import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Target, 
  Shield, 
  Bell, 
  Clock,
  Save,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Database
} from 'lucide-react';
import { useTradingData } from '../../hooks/useTradingData';
import { formatCurrency } from '../../utils/calculations';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
];

export function Settings() {
  const { portfolio, setPortfolio, userSettings, setUserSettings, exportData, importData, trades, goals, assets } = useTradingData();
  const [activeTab, setActiveTab] = useState('capital');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const [capitalSettings, setCapitalSettings] = useState({
    initialCapital: portfolio.initialCapital.toString(),
    currentBalance: portfolio.currentBalance.toString(),
    currency: portfolio.currency || 'USD',
  });

  const [riskSettings, setRiskSettings] = useState({
    maxDailyLoss: portfolio.maxDailyLoss.toString(),
    maxDailyLossPercentage: portfolio.maxDailyLossPercentage.toString(),
    maxPositionSize: portfolio.maxPositionSize?.toString() || '1000',
    maxPositionSizePercentage: portfolio.maxPositionSizePercentage?.toString() || '10',
    riskRewardRatio: portfolio.riskRewardRatio?.toString() || '2',
    stopLossRequired: userSettings?.riskManagement?.stopLossRequired || false,
    takeProfitRequired: userSettings?.riskManagement?.takeProfitRequired || false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    dailyLossLimit: userSettings?.notifications?.dailyLossLimit || true,
    goalProgress: userSettings?.notifications?.goalProgress || true,
    tradeReminders: userSettings?.notifications?.tradeReminders || false,
  });

  const [tradingHours, setTradingHours] = useState({
    start: userSettings?.tradingHours?.start || '09:30',
    end: userSettings?.tradingHours?.end || '16:00',
    timezone: userSettings?.tradingHours?.timezone || 'America/New_York',
  });

  const handleSaveCapitalSettings = () => {
    setPortfolio(prev => ({
      ...prev,
      initialCapital: parseFloat(capitalSettings.initialCapital) || prev.initialCapital,
      currentBalance: parseFloat(capitalSettings.currentBalance) || prev.currentBalance,
      currency: capitalSettings.currency,
    }));
    alert('Capital settings saved successfully!');
  };

  const handleSaveRiskSettings = () => {
    setPortfolio(prev => ({
      ...prev,
      maxDailyLoss: parseFloat(riskSettings.maxDailyLoss) || 0,
      maxDailyLossPercentage: parseFloat(riskSettings.maxDailyLossPercentage) || 0,
      maxPositionSize: parseFloat(riskSettings.maxPositionSize) || 1000,
      maxPositionSizePercentage: parseFloat(riskSettings.maxPositionSizePercentage) || 10,
      riskRewardRatio: parseFloat(riskSettings.riskRewardRatio) || 2,
    }));

    setUserSettings(prev => ({
      ...prev,
      riskManagement: {
        ...prev?.riskManagement,
        maxDailyLoss: parseFloat(riskSettings.maxDailyLoss) || 0,
        maxDailyLossPercentage: parseFloat(riskSettings.maxDailyLossPercentage) || 0,
        maxPositionSize: parseFloat(riskSettings.maxPositionSize) || 1000,
        maxPositionSizePercentage: parseFloat(riskSettings.maxPositionSizePercentage) || 10,
        riskRewardRatio: parseFloat(riskSettings.riskRewardRatio) || 2,
        stopLossRequired: riskSettings.stopLossRequired,
        takeProfitRequired: riskSettings.takeProfitRequired,
      },
    }));
    alert('Risk management settings saved successfully!');
  };

  const handleSaveNotificationSettings = () => {
    setUserSettings(prev => ({
      ...prev,
      notifications: notificationSettings,
    }));
    alert('Notification settings saved successfully!');
  };

  const handleSaveTradingHours = () => {
    setUserSettings(prev => ({
      ...prev,
      tradingHours: tradingHours,
    }));
    alert('Trading hours saved successfully!');
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trading-journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleImportData = () => {
    if (!importFile) {
      alert('Please select a file to import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        if (success) {
          alert('Data imported successfully! The page will refresh to load the new data.');
          window.location.reload();
        } else {
          alert('Error importing data. Please check the file format.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error reading file. Please ensure it\'s a valid JSON export file.');
      }
    };
    reader.readAsText(importFile);
  };

  const handleResetAllData = () => {
    if (showResetConfirm) {
      // Reset all data
      localStorage.clear();
      window.location.reload();
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const getDataSummary = () => {
    const totalDeposits = portfolio.deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawals = portfolio.withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const closedTrades = trades.filter(t => !t.isOpen).length;
    const openTrades = trades.filter(t => t.isOpen).length;
    const activeGoals = goals.filter(g => g.isActive).length;
    const completedGoals = goals.filter(g => !g.isActive).length;

    return {
      totalTrades: trades.length,
      closedTrades,
      openTrades,
      totalDeposits,
      totalWithdrawals,
      totalTransactions: portfolio.deposits.length + portfolio.withdrawals.length,
      totalGoals: goals.length,
      activeGoals,
      completedGoals,
      totalAssets: assets.length,
      favoriteAssets: assets.filter(a => a.isActive).length,
    };
  };

  const dataSummary = getDataSummary();

  const tabs = [
    { id: 'capital', name: 'Capital & Currency', icon: DollarSign },
    { id: 'risk', name: 'Risk Management', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'trading', name: 'Trading Hours', icon: Clock },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure your trading journal preferences and manage your data
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Capital & Currency Settings */}
      {activeTab === 'capital' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-medium text-gray-900">Capital & Currency Settings</h3>
            <p className="text-sm text-gray-500">Manage your trading capital and currency preferences</p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Capital</label>
                <input
                  type="number"
                  step="0.01"
                  value={capitalSettings.initialCapital}
                  onChange={(e) => setCapitalSettings(prev => ({ ...prev, initialCapital: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="10000.00"
                />
                <p className="mt-1 text-xs text-gray-500">Your starting trading capital</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={capitalSettings.currentBalance}
                  onChange={(e) => setCapitalSettings(prev => ({ ...prev, currentBalance: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="10000.00"
                />
                <p className="mt-1 text-xs text-gray-500">Your current account balance</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={capitalSettings.currency}
                  onChange={(e) => setCapitalSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Your trading account currency</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCapitalSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Capital Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Risk Management Settings */}
      {activeTab === 'risk' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
            <h3 className="text-lg font-medium text-gray-900">Risk Management Settings</h3>
            <p className="text-sm text-gray-500">Configure your risk limits and trading rules</p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Daily Loss ({portfolio.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskSettings.maxDailyLoss}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDailyLoss: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="500.00"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum loss allowed per day in your currency</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Daily Loss (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskSettings.maxDailyLossPercentage}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDailyLossPercentage: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="5.0"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum loss as percentage of capital</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Position Size ({portfolio.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskSettings.maxPositionSize}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositionSize: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="1000.00"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum position size in your currency</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Position Size (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskSettings.maxPositionSizePercentage}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositionSizePercentage: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="10.0"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum position as percentage of capital</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Risk/Reward Ratio</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskSettings.riskRewardRatio}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, riskRewardRatio: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="2.0"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum risk/reward ratio for trades</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="stop-loss-required"
                  type="checkbox"
                  checked={riskSettings.stopLossRequired}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, stopLossRequired: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="stop-loss-required" className="ml-2 block text-sm text-gray-900">
                  Require stop loss for all trades
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="take-profit-required"
                  type="checkbox"
                  checked={riskSettings.takeProfitRequired}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, takeProfitRequired: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="take-profit-required" className="ml-2 block text-sm text-gray-900">
                  Require take profit target for all trades
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveRiskSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Risk Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            <p className="text-sm text-gray-500">Configure alerts and reminders</p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Daily Loss Limit Alerts</h4>
                  <p className="text-sm text-gray-500">Get notified when approaching daily loss limits</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.dailyLossLimit}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, dailyLossLimit: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Goal Progress Updates</h4>
                  <p className="text-sm text-gray-500">Receive updates on goal achievement progress</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.goalProgress}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, goalProgress: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Trade Reminders</h4>
                  <p className="text-sm text-gray-500">Reminders to log trades and journal entries</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.tradeReminders}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, tradeReminders: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotificationSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trading Hours Settings */}
      {activeTab === 'trading' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
            <h3 className="text-lg font-medium text-gray-900">Trading Hours</h3>
            <p className="text-sm text-gray-500">Set your preferred trading schedule</p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Market Open</label>
                <input
                  type="time"
                  value={tradingHours.start}
                  onChange={(e) => setTradingHours(prev => ({ ...prev, start: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Market Close</label>
                <input
                  type="time"
                  value={tradingHours.end}
                  onChange={(e) => setTradingHours(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={tradingHours.timezone}
                  onChange={(e) => setTradingHours(prev => ({ ...prev, timezone: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveTradingHours}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Trading Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Data Summary */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-lg font-medium text-gray-900">Data Overview</h3>
              <p className="text-sm text-gray-500">Summary of your trading journal data</p>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{dataSummary.totalTrades}</div>
                  <div className="text-sm text-gray-600">Total Trades</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataSummary.openTrades} open • {dataSummary.closedTrades} closed
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{dataSummary.totalTransactions}</div>
                  <div className="text-sm text-gray-600">Transactions</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {portfolio.deposits.length} deposits • {portfolio.withdrawals.length} withdrawals
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{dataSummary.totalGoals}</div>
                  <div className="text-sm text-gray-600">Goals</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataSummary.activeGoals} active • {dataSummary.completedGoals} completed
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{dataSummary.totalAssets}</div>
                  <div className="text-sm text-gray-600">Assets</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataSummary.favoriteAssets} favorites
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Portfolio Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Initial Capital:</span>
                      <span className="font-medium">{formatCurrency(portfolio.initialCapital, portfolio.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className="font-medium">{formatCurrency(portfolio.currentBalance, portfolio.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Deposits:</span>
                      <span className="font-medium text-green-600">{formatCurrency(dataSummary.totalDeposits, portfolio.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Withdrawals:</span>
                      <span className="font-medium text-red-600">{formatCurrency(dataSummary.totalWithdrawals, portfolio.currency)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Data Storage</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• All data stored locally in your browser</div>
                    <div>• Export regularly to backup your data</div>
                    <div>• Import to restore from backup files</div>
                    <div>• Data persists across browser sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-500">Download all your trading data as a backup</p>
            </div>
            <div className="px-6 py-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">What's included in the export:</h4>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• All trades (open and closed) with complete details</li>
                      <li>• Portfolio settings and transaction history</li>
                      <li>• All deposits and withdrawals</li>
                      <li>• Goals and their progress tracking</li>
                      <li>• Asset library and favorites</li>
                      <li>• User preferences and settings</li>
                      <li>• Journal entries and notes</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleExportData}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-3" />
                Export All Data
              </button>
              
              <p className="mt-3 text-xs text-gray-500 text-center">
                Export creates a JSON file with all your data. Keep this file safe as a backup.
              </p>
            </div>
          </div>

          {/* Import Data */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
              <p className="text-sm text-gray-500">Restore data from a previous export</p>
            </div>
            <div className="px-6 py-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Upload className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Import Instructions:</h4>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Select a JSON file exported from this application</li>
                      <li>• Import will merge with existing data</li>
                      <li>• Duplicate entries will be avoided</li>
                      <li>• Page will refresh after successful import</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Export File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                  />
                </div>
                
                <button
                  onClick={handleImportData}
                  disabled={!importFile}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Upload className="h-5 w-5 mr-3" />
                  Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg">
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Reset all data including trades, portfolio, and settings. This action cannot be undone.
          </p>
          <button
            onClick={handleResetAllData}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors ${
              showResetConfirm
                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {showResetConfirm ? 'Click Again to Confirm Reset' : 'Reset All Data'}
          </button>
        </div>
      </div>
    </div>
  );
}