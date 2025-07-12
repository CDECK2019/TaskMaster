import React from 'react';
import { 
  TrashIcon, 
  CheckIcon, 
  PlusIcon, 
  PencilIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  CheckIcon as CheckIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';

interface IconButtonProps {
  variant: 'delete' | 'complete' | 'incomplete' | 'add' | 'edit' | 'close' | 'star' | 'star-filled';
  onClick: () => void;
  'aria-label': string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const IconButton: React.FC<IconButtonProps> = ({
  variant,
  onClick,
  'aria-label': ariaLabel,
  className = '',
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const getIcon = () => {
    switch (variant) {
      case 'delete':
        return <TrashIcon className={`${sizeClasses[size]} text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors`} />;
      case 'complete':
        return <CheckIconSolid className={`${sizeClasses[size]} text-green-600 dark:text-green-400 transition-colors`} />;
      case 'incomplete':
        return <div className={`${sizeClasses[size]} border-2 border-gray-400 dark:border-gray-500 rounded hover:border-blue-500 dark:hover:border-blue-400 transition-colors`} />;
      case 'add':
        return <PlusIcon className={`${sizeClasses[size]} text-blue-600 dark:text-blue-400 transition-colors`} />;
      case 'edit':
        return <PencilIcon className={`${sizeClasses[size]} text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors`} />;
      case 'close':
        return <XMarkIcon className={`${sizeClasses[size]} text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors`} />;
      case 'star':
        return <StarIcon className={`${sizeClasses[size]} text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 transition-colors`} />;
      case 'star-filled':
        return <StarIconSolid className={`${sizeClasses[size]} text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors`} />;
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        ${buttonSizeClasses[size]}
        rounded-md
        hover:bg-gray-100 dark:hover:bg-gray-700/50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
        dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        min-w-[44px] min-h-[44px]
        flex items-center justify-center
        group
        ${className}
      `}
    >
      {getIcon()}
    </button>
  );
};

export default IconButton;