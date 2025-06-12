import React, { useState } from 'react';
import { TrendingUp, Menu, Cloud, CloudOff, RefreshCw, LogOut, User } from 'lucide-react';
import { useTradingData } from '../../hooks/useTradingData';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { loading, error, refreshData } = useTradingData();
  const { logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
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

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">pasham@yash.com</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">Signed in as</p>
                      <p className="text-gray-500 truncate">pasham@yash.com</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}