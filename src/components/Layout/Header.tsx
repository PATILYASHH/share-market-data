import React, { useState } from 'react';
import { TrendingUp, Menu, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useTradingData } from '../../hooks/useTradingData';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { loading, error, refreshData } = useTradingData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <TrendingUp className="h-8 w-8 text-blue-600 md:ml-0 ml-2" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Trading Journal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Cloud Status Indicator */}
            <div className="flex items-center space-x-2">
              {error ? (
                <div className="flex items-center text-red-600" title={`Error: ${error}`}>
                  <CloudOff className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">Offline</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600" title="Connected to cloud">
                  <Cloud className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">Cloud</span>
                </div>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="hidden sm:inline text-sm ml-2">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}