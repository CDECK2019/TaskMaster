import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { IconThemeProvider } from './contexts/IconThemeContext';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Gantt from './components/Gantt';
import Workstreams from './components/Workstreams';

function App() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <IconThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Auth />
              <Toaster position="top-right" />
            </div>
        </IconThemeProvider>
      </ThemeProvider>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'gantt':
        return <Gantt />;
      case 'workstreams':
        return <Workstreams />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <IconThemeProvider>
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar activeView={activeView} onViewChange={setActiveView} />
            <main className="flex-1 overflow-y-auto">
              <div className="p-8">
                {renderContent()}
              </div>
            </main>
            <Toaster position="top-right" />
          </div>
      </IconThemeProvider>
    </ThemeProvider>
  );
}

export default App;