import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIconTheme } from '../contexts/IconThemeContext';
import ThemeToggle from './ThemeToggle';
import IconThemeSelector from './IconThemeSelector';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { signOut } = useAuth();
  const { icons } = useIconTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.home },
    { id: 'projects', label: 'Projects', icon: icons.projects },
    { id: 'tasks', label: 'All Tasks', icon: icons.tasks },
    { id: 'gantt', label: 'Timeline', icon: icons.timeline },
    { id: 'workstreams', label: 'Workstreams', icon: icons.workstreams },
    { id: 'settings', label: 'Settings', icon: icons.settings }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Project Management</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">CUSTOMIZE</span>
            <div className="flex items-center space-x-1">
              <IconThemeSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button className="w-full flex items-center px-4 py-3 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
          <icons.add className="w-5 h-5 mr-3" />
          Create New
        </button>
        <button 
          onClick={signOut}
          className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <icons.logout className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;