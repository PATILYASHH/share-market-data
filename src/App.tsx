import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { WelcomePopup } from './components/Layout/WelcomePopup';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TradeForm } from './components/TradeEntry/TradeForm';
import { Portfolio } from './components/Portfolio/Portfolio';
import { GoalManager } from './components/Goals/GoalManager';
import { AssetManager } from './components/Assets/AssetManager';
import { Settings } from './components/Settings/Settings';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Check if user has seen the welcome popup before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenWelcome) {
      setShowWelcomePopup(true);
    }
  }, []);

  const handleWelcomeContinue = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

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
      
      {/* Welcome Popup */}
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onContinue={handleWelcomeContinue} 
      />
    </div>
  );
}

export default App;