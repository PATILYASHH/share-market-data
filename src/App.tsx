import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TradeForm } from './components/TradeEntry/TradeForm';
import { Portfolio } from './components/Portfolio/Portfolio';
import { GoalManager } from './components/Goals/GoalManager';
import { AssetManager } from './components/Assets/AssetManager';
import { Settings } from './components/Settings/Settings';
import { LoginForm } from './components/Auth/LoginForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading, error, login } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'trades':
        return <TradeForm />;
      case 'assets':
        return <AssetManager />;
      case 'portfolio':
        return <Portfolio />;
      case 'goals':
        return <GoalManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} loading={loading} error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

export default App;