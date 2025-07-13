// Unified design system for consistent UI components
export const ui = {
  // Buttons
  button: {
    primary:
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium " +
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 " +
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
      "dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 " +
      "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    
    secondary:
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium " +
      "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 " +
      "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 " +
      "dark:focus:ring-gray-400 dark:focus:ring-offset-gray-800 " +
      "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    
    danger:
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium " +
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 " +
      "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 " +
      "dark:focus:ring-red-400 dark:focus:ring-offset-gray-800 " +
      "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  },

  // Icons - standardized sizes
  icon: {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  },

  // Cards and containers
  card: 
    "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 " +
    "hover:shadow-md transition-shadow",

  // Form inputs
  input:
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 " +
    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white " +
    "placeholder-gray-500 dark:placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "dark:focus:ring-blue-400 transition-colors",

  // Text areas
  textarea:
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 " +
    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white " +
    "placeholder-gray-500 dark:placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "dark:focus:ring-blue-400 transition-colors resize-none",

  // Select dropdowns
  select:
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 " +
    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "dark:focus:ring-blue-400 transition-colors",

  // Labels
  label:
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",

  // Badges and tags
  badge: {
    primary: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    success: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    danger: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    gray: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  },

  // Loading states
  spinner:
    "w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin",

  // Dividers
  divider:
    "border-t border-gray-200 dark:border-gray-700",

  // Focus ring for accessibility
  focusRing:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
    "dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
};

// Color palette - limited to 4 shades as recommended
export const colors = {
  gray: {
    50: 'rgb(248 250 252)', // slate-50
    300: 'rgb(203 213 225)', // slate-300  
    600: 'rgb(71 85 105)', // slate-600
    900: 'rgb(15 23 42)' // slate-900
  },
  blue: {
    500: 'rgb(59 130 246)',
    600: 'rgb(37 99 235)',
    700: 'rgb(29 78 216)'
  },
  green: {
    500: 'rgb(34 197 94)',
    600: 'rgb(22 163 74)'
  },
  red: {
    500: 'rgb(239 68 68)',
    600: 'rgb(220 38 38)'
  },
  yellow: {
    500: 'rgb(245 158 11)',
    600: 'rgb(217 119 6)'
  }
};

// Priority color mappings using our limited palette
export const priorityColors = {
  high: ui.badge.danger,
  medium: ui.badge.warning,
  low: ui.badge.success
};

// Status color mappings
export const statusColors = {
  completed: ui.badge.success,
  pending: ui.badge.gray,
  overdue: ui.badge.danger
};