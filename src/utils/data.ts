import { Project, Task, Workstream, WorkstreamColumn } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Personal Projects',
    description: 'My personal development and learning goals',
    color: 'bg-blue-500',
    createdAt: '2024-01-15',
    workstreamCount: 2,
    taskCount: 8,
    completedCount: 3
  },
  {
    id: '2',
    title: 'Work Tasks',
    description: 'Daily work assignments and deliverables',
    color: 'bg-purple-500',
    createdAt: '2024-01-10',
    workstreamCount: 1,
    taskCount: 12,
    completedCount: 7
  },
  {
    id: '3',
    title: 'Home & Family',
    description: 'Household tasks and family activities',
    color: 'bg-green-500',
    createdAt: '2024-01-20',
    workstreamCount: 1,
    taskCount: 6,
    completedCount: 2
  }
];

// Keep the old mockLists for backward compatibility
export const mockLists = mockProjects;
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete React project',
    description: 'Build a comprehensive project management app',
    completed: false,
    priority: 'high',
    dueDate: '2024-02-15',
    createdAt: '2024-01-15',
    listId: '1',
    assignee: 'John Doe',
    tags: ['development', 'react'],
    starred: true
  },
  {
    id: '2',
    title: 'Learn TypeScript',
    description: 'Master TypeScript fundamentals and advanced concepts',
    completed: true,
    priority: 'medium',
    dueDate: '2024-01-30',
    createdAt: '2024-01-10',
    listId: '1',
    assignee: 'John Doe',
    tags: ['learning', 'typescript'],
    starred: false
  },
  {
    id: '3',
    title: 'Prepare quarterly report',
    description: 'Compile Q1 performance metrics and analysis',
    completed: false,
    priority: 'high',
    dueDate: '2024-02-01',
    createdAt: '2024-01-20',
    listId: '2',
    assignee: 'Jane Smith',
    tags: ['reporting', 'analytics'],
    starred: true
  },
  {
    id: '4',
    title: 'Team meeting preparation',
    description: 'Prepare agenda and materials for weekly team sync',
    completed: false,
    priority: 'medium',
    dueDate: '2024-01-25',
    createdAt: '2024-01-22',
    listId: '2',
    assignee: 'John Doe',
    tags: ['meeting', 'planning'],
    starred: false
  }
];

export const mockWorkstreams: Workstream[] = [
  {
    id: '1',
    title: 'Product Development',
    columns: [
      {
        id: '1',
        title: 'Backlog',
        color: 'bg-gray-100',
        tasks: [
          {
            id: '5',
            title: 'User authentication system',
            description: 'Implement secure login and registration',
            completed: false,
            priority: 'high',
            dueDate: '2024-02-20',
            createdAt: '2024-01-15',
            listId: '1',
            tags: ['backend', 'security']
          }
        ]
      },
      {
        id: '2',
        title: 'In Progress',
        color: 'bg-blue-100',
        tasks: [
          {
            id: '6',
            title: 'Dashboard UI design',
            description: 'Create mockups and prototypes',
            completed: false,
            priority: 'medium',
            dueDate: '2024-02-10',
            createdAt: '2024-01-18',
            listId: '1',
            tags: ['design', 'ui']
          }
        ]
      },
      {
        id: '3',
        title: 'Review',
        color: 'bg-yellow-100',
        tasks: []
      },
      {
        id: '4',
        title: 'Done',
        color: 'bg-green-100',
        tasks: [
          {
            id: '7',
            title: 'Project setup',
            description: 'Initialize repository and development environment',
            completed: true,
            priority: 'high',
            dueDate: '2024-01-20',
            createdAt: '2024-01-10',
            listId: '1',
            tags: ['setup', 'development']
          }
        ]
      }
    ]
  }
];

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getProgressPercentage = (completed: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    case 'in_progress':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    case 'review':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'done':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'review':
      return 'Review';
    case 'done':
      return 'Done';
    default:
      return 'To Do';
  }
};