import React, { useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useIconTheme } from '../contexts/IconThemeContext';

const IconThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes, icons } = useIconTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as any);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Change icon theme"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Icon Themes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Choose your preferred icon style
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableThemes.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  
                  // Get theme-specific icons for preview
                  let PreviewIcon, TaskIcon, StarIcon;
                  try {
                    const themeIcons = theme.id === 'pepicons' ? 
                      require('../contexts/IconThemeContext').pepiconsSVGs :
                      theme.id === 'pixelart' ?
                      require('../contexts/IconThemeContext').pixelartSVGs :
                      icons;
                    
                    PreviewIcon = themeIcons.home || icons.home;
                    TaskIcon = themeIcons.tasks || icons.tasks;
                    StarIcon = themeIcons.starred || icons.starred;
                  } catch {
                    PreviewIcon = icons.home;
                    TaskIcon = icons.tasks;
                    StarIcon = icons.starred;
                  }
                  
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`p-4 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-700 shadow-md'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className={`font-semibold text-lg ${
                          isSelected 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {theme.name}
                        </h4>
                        {isSelected && (
                          <div className="bg-blue-600 dark:bg-blue-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <p className={`text-sm mb-4 ${
                        isSelected 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {theme.description}
                      </p>
                      
                      {/* Source attribution for open source themes */}
                      {theme.source && (
                        <p className={`text-xs mb-3 font-medium ${
                          isSelected 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          📦 {theme.source}
                        </p>
                      )}
                      
                      {/* Icon Preview */}
                      <div className={`flex items-center justify-center space-x-4 p-4 rounded-lg ${
                        isSelected 
                          ? 'bg-blue-100 dark:bg-blue-800/50' 
                          : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <div className="flex flex-col items-center space-y-1">
                          <PreviewIcon className={`w-6 h-6 ${
                            isSelected 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Home</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <TaskIcon className={`w-6 h-6 ${
                            isSelected 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Tasks</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <StarIcon className={`w-6 h-6 ${
                            isSelected 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Star</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current theme: <span className="font-medium text-gray-900 dark:text-white">
                    {availableThemes.find(t => t.id === currentTheme)?.name}
                  </span>
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IconThemeSelector;