import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './contexts/ThemeContext';
import { IconThemeProvider } from './contexts/IconThemeContext';
import { queryClient } from './lib/queryClient';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Toast from './components/ui/Toast';
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
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <IconThemeProvider>
          <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Auth />
              <Toast />
            </div>
          </QueryClientProvider>
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
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar activeView={activeView} onViewChange={setActiveView} />
            <main className="flex-1 overflow-y-auto">
              <div className="p-8">
                {renderContent()}
              </div>
            </main>
            <Toast />
          </div>
          </ErrorBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </IconThemeProvider>
    </ThemeProvider>
  );
}

export default App;