export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate?: string;
  createdAt: string;
  listId: string;
  workstreamId?: string;
  subtasks?: Task[];
  assignee?: string;
  tags?: string[];
  starred?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
  createdAt: string;
  workstreamCount: number;
  taskCount?: number;
  completedCount?: number;
  workstreams?: Workstream[];
}

export interface WorkstreamColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export interface Workstream {
  id: string;
  title: string;
  projectId?: string;
  columns: WorkstreamColumn[];
  taskCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}