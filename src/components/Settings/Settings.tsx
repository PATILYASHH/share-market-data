import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Target, 
  Shield, 
  Bell, 
  Clock,
  Save,
  RefreshCw,
  Cloud,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useTradingData } from '../../hooks/useTradingData';
import { formatCurrency } from '../../utils/calculations';

const timezones = [
  'Asia/Kolkata',
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
  'Australia/Sydney',
];

export function Settings() {
  const { 
    portfolio, 
    setPortfolio, 
    userSettings, 
    setUserSettings, 
    exportData, 
    importData,
    refreshData,
    loading,
    error 
  } = useTradingData();
  
  const [activeTab, setActiveTab] = useState('capital');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [capitalSettings, setCapitalSettings] = useState({
    initialCapital: portfolio.initialCapital.toString(),
    currentBalance: portfolio.currentBalance.toString(),
  });

  const [riskSettings, setRiskSettings] = useState({
    maxDailyLoss: portfolio.maxDailyLoss.toString(),
    maxDailyLossPercentage: portfolio.maxDailyLossPercentage.toString(),
    maxPositionSize: (portfolio.maxPositionSize || 200).toString(),
    maxPositionSizePercentage: (portfolio.maxPositionSizePercentage || 10).toString(),
    riskRewardRatio: (portfolio.riskRewardRatio || 2).toString(),
    stopLossRequired: userSettings?.riskManagement?.stopLossRequired || false,
    takeProfitRequired: userSettings?.riskManagement?.takeProfitRequired || false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    dailyLossLimit: userSettings?.notifications?.dailyLossLimit || true,
    goalProgress: userSettings?.notifications?.goalProgress || true,
    tradeReminders: userSettings?.notifications?.tradeReminders || false,
  });

  const [tradingHours, setTradingHours] = useState({
    start: userSettings?.tradingHours?.start || '09:15',
    end: userSettings?.tradingHours?.end || '15:30',
    timezone: userSettings?.tradingHours?.timezone || 'Asia/Kolkata',
  });

  // Update local state when portfolio/settings change
  useEffect(() => {
    setCapitalSettings({
      initialCapital: portfolio.initialCapital.toString(),
      currentBalance: portfolio.currentBalance.toString(),
    });
  }, [portfolio]);

  useEffect(() => {
    setRiskSettings({
      maxDailyLoss: portfolio.maxDailyLoss.toString(),
      maxDailyLossPercentage: portfolio.maxDailyLossPercentage.toString(),
      maxPositionSize: (portfolio.maxPositionSize || 200).toString(),
      maxPositionSizePercentage: (portfolio.maxPositionSizePercentage || 10).toString(),
      riskRewardRatio: (portfolio.riskRewardRatio || 2).toString(),
      stopLossRequired: userSettings?.riskManagement?.stopLossRequired || false,
      takeProfitRequired: userSettings?.riskManagement?.takeProfitRequired || false,
    });
  }, [portfolio, userSettings]);

  useEffect(() => {
    if (userSettings) {
      setNotificationSettings({
        dailyLossLimit: userSettings.notifications?.dailyLossLimit || true,
        goalProgress: userSettings.notifications?.goalProgress || true,
        tradeReminders: userSettings.notifications?.tradeReminders || false,
      });

      setTradingHours({
        start: userSettings.tradingHours?.start || '09:15',
        end: userSettings.tradingHours?.end || '15:30',
        timezone: userSettings.tradingHours?.timezone || 'Asia/Kolkata',
      });
    }
  }, [userSettings]);

  const showSuccessMessage = (message: string) => {
    setSaveSuccess(message);
    setSaveError(null);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setSaveError(message);
    setSaveSuccess(null);
    setTimeout(() => setSaveError(null), 5000);
  };

  const handleSaveCapitalSettings = async () => {
    setIsSaving(true);
    try {
      const newInitialCapital = parseFloat(capitalSettings.initialCapital) || portfolio.initialCapital;
      const newCurrentBalance = parseFloat(capitalSettings.currentBalance) || portfolio.currentBalance;

      await setPortfolio(prev => ({
        ...prev,
        initialCapital: newInitialCapital,
        currentBalance: newCurrentBalance,
        currency: 'INR', // Always INR
      }));

      // Also update user settings currency
      await setUserSettings(prev => ({
        ...prev,
        currency: 'INR', // Always INR
      }));

      showSuccessMessage('Capital settings saved successfully!');
    } catch (error) {
      console.error('Error saving capital settings:', error);
      showErrorMessage('Error saving capital settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRiskSettings = async () => {
    setIsSaving(true);
    try {
      const newMaxDailyLoss = parseFloat(riskSettings.maxDailyLoss) || 0;
      const newMaxDailyLossPercentage = parseFloat(riskSettings.maxDailyLossPercentage) || 0;
      const newMaxPositionSize = parseFloat(riskSettings.maxPositionSize) || 200;
      const newMaxPositionSizePercentage = parseFloat(riskSettings.maxPositionSizePercentage) || 10;
      const newRiskRewardRatio = parseFloat(riskSettings.riskRewardRatio) || 2;

      await setPortfolio(prev => ({
        ...prev,
        maxDailyLoss: newMaxDailyLoss,
        maxDailyLossPercentage: newMaxDailyLossPercentage,
        maxPositionSize: newMaxPositionSize,
        maxPositionSizePercentage: newMaxPositionSizePercentage,
        riskRewardRatio: newRiskRewardRatio,
      }));

      await setUserSettings(prev => ({
        ...prev,
        riskManagement: {
          ...prev?.riskManagement,
          maxDailyLoss: newMaxDailyLoss,
          maxDailyLossPercentage: newMaxDailyLossPercentage,
          maxPositionSize: newMaxPositionSize,
          maxPositionSizePercentage: newMaxPositionSizePercentage,
          riskRewardRatio: newRiskRewardRatio,
          stopLossRequired: riskSettings.stopLossRequired,
          takeProfitRequired: riskSettings.takeProfitRequired,
        },
      }));

      showSuccessMessage('Risk management settings saved successfully!');
    } catch (error) {
      console.error('Error saving risk settings:', error);
      showErrorMessage('Error saving risk settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await setUserSettings(prev => ({
        ...prev,
        notifications: notificationSettings,
      }));
      showSuccessMessage('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showErrorMessage('Error saving notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTradingHours = async () => {
    setIsSaving(true);
    try {
      await setUserSettings(prev => ({
        ...prev,
        tradingHours: tradingHours,
        timezone: tradingHours.timezone, // Also update main timezone
      }));

      // Update portfolio timezone as well
      await setPortfolio(prev => ({
        ...prev,
        timezone: tradingHours.timezone,
      }));

      showSuccessMessage('Trading hours saved successfully!');
    } catch (error) {
      console.error('Error saving trading hours:', error);
      showErrorMessage('Error saving trading hours. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccessMessage('Data exported successfully!');
    } catch (error) {
      showErrorMessage('Error exporting data. Please try again.');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const success = await importData(text);
      if (success) {
        showSuccessMessage('Data imported successfully!');
        // Refresh the page to show updated data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showErrorMessage('Error importing data. Please check the file format.');
      }
    } catch (error) {
      showErrorMessage('Error importing data. Please try again.');
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showSuccessMessage('Data refreshed successfully!');
    } catch (error) {
      showErrorMessage('Error refreshing data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetAllData = () => {
    if (showResetConfirm) {
      showErrorMessage('Reset functionality would clear all cloud data. This feature needs to be implemented with proper confirmation.');
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const tabs = [
    { id: 'capital', name: 'Capital Settings', icon: DollarSign },
    { id: 'risk', name: 'Risk Management', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'trading', name: 'Trading Hours', icon: Clock },
    { id: 'data', name: 'Data Management', icon: Cloud },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure your trading journal preferences and manage your cloud data
        </p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm text-green-700">{saveSuccess}</p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Capital Settings */}
      {activeTab === 'capital' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-medium text-gray-900">Capital Settings</h3>
            <p className="text-sm text-gray-500">Manage your trading capital in Indian Rupees (₹)</p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Capital (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={capitalSettings.initialCapital}
                  onChange={(e) => setCapitalSettings(prev => ({ ...prev, initialCapital: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="2000.00"
                />
                <p className="mt-1 text-xs text-gray-500">Your starting trading capital in ₹ (Default: ₹2,000)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={capitalSettings.currentBalance}
                  onChange={(e) => setCapitalSettings(prev => ({ ...prev, currentBalance: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="2000.00"
                />
                <p className="mt-1 text-xs text-gray-500">Your current account balance in ₹</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Currency Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This application uses Indian Rupees (₹) as the only currency. All amounts are displayed and calculated in ₹.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCapitalSettings}
                disabled={loading || isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Capital Settings'}
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
            <p className="text-sm text-gray-500">Configure your risk limits and trading rules in ₹</p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Daily Loss (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskSettings.maxDailyLoss}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDailyLoss: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="100.00"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum loss allowed per day in ₹ (Default: ₹100)</p>
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
                <label className="block text-sm font-medium text-gray-700">Max Position Size (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskSettings.maxPositionSize}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositionSize: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="200.00"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum position size in ₹ (Default: ₹200)</p>
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

              <div className="sm:col-span-2">
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
                disabled={loading || isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Risk Settings'}
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
                disabled={loading || isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
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
            <p className="text-sm text-gray-500">Set your preferred trading schedule (Default: Indian market hours)</p>
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
                <p className="mt-1 text-xs text-gray-500">Indian market: 09:15</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Market Close</label>
                <input
                  type="time"
                  value={tradingHours.end}
                  onChange={(e) => setTradingHours(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Indian market: 15:30</p>
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
                <p className="mt-1 text-xs text-gray-500">Default: Asia/Kolkata (IST)</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveTradingHours}
                disabled={loading || isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Trading Hours'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Cloud Data Management */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-medium text-gray-900">Cloud Data Management</h3>
              <p className="text-sm text-gray-500">Manage your cloud-stored trading data</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <button
                  onClick={handleRefreshData}
                  disabled={isRefreshing || loading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>

                <button
                  onClick={handleExportData}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>

                <label className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer">
                  {isImporting ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isImporting ? 'Importing...' : 'Import Data'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    disabled={isImporting || loading}
                  />
                </label>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• <strong>Refresh:</strong> Sync latest data from cloud storage</p>
                <p>• <strong>Export:</strong> Download all your data as a JSON file</p>
                <p>• <strong>Import:</strong> Upload and restore data from a JSON file</p>
              </div>
            </div>
          </div>

          {/* Reset Data Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Reset all cloud data including trades, portfolio, and settings. This action cannot be undone.
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
      )}
    </div>
  );
}