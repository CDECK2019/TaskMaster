import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useIconTheme } from '../contexts/IconThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { icons } = useIconTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <icons.lightMode className="w-4 h-4" />
      ) : (
        <icons.darkMode className="w-4 h-4" />
      )}
    </button>
  );
};

export default ThemeToggle;