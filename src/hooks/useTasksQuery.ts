import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import toast from 'react-hot-toast';

// Query keys for consistent cache management
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// Fetch tasks with proper error handling
const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return data.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    completed: task.completed,
    priority: task.priority,
    dueDate: task.due_date,
    createdAt: task.created_at.split('T')[0],
    listId: task.list_id,
    assignee: task.assignee,
    tags: task.tags || [],
    starred: task.starred || false
  }));
};

// Create task mutation
const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description,
      completed: taskData.completed,
      priority: taskData.priority,
      due_date: taskData.dueDate,
      list_id: taskData.listId,
      assignee: taskData.assignee,
      tags: taskData.tags,
      user_id: user.id,
      starred: taskData.starred || false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    completed: data.completed,
    priority: data.priority,
    dueDate: data.due_date,
    createdAt: data.created_at.split('T')[0],
    listId: data.list_id,
    assignee: data.assignee,
    tags: data.tags || [],
    starred: data.starred || false
  };
};

// Update task mutation
const updateTask = async ({ id, updates }: { id: string; updates: Partial<Task> }): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      completed: updates.completed,
      priority: updates.priority,
      due_date: updates.dueDate === '' ? null : updates.dueDate,
      list_id: updates.listId,
      assignee: updates.assignee,
      tags: updates.tags,
      starred: updates.starred,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    completed: data.completed,
    priority: data.priority,
    dueDate: data.due_date,
    createdAt: data.created_at.split('T')[0],
    listId: data.list_id,
    assignee: data.assignee,
    tags: data.tags || [],
    starred: data.starred || false
  };
};

// Delete task mutation
const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
};

// Custom hooks using TanStack Query
export const useTasks = () => {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: fetchTasks,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Optimistically update the cache
      queryClient.setQueryData<Task[]>(taskKeys.all, (old = []) => [newTask, ...old]);
      toast.success('Task created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      // Optimistically update
      queryClient.setQueryData<Task[]>(taskKeys.all, (old = []) =>
        old.map(task => task.id === id ? { ...task, ...updates } : task)
      );

      return { previousTasks };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Task updated successfully');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      queryClient.setQueryData<Task[]>(taskKeys.all, (old = []) =>
        old.filter(task => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Task deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Convenience hooks for common operations
export const useToggleTask = () => {
  const updateMutation = useUpdateTask();
  const queryClient = useQueryClient();

  return (taskId: string) => {
    const tasks = queryClient.getQueryData<Task[]>(taskKeys.all) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      updateMutation.mutate({
        id: taskId,
        updates: { completed: !task.completed }
      });
    }
  };
};

export const useToggleStarred = () => {
  const updateMutation = useUpdateTask();
  const queryClient = useQueryClient();

  return (taskId: string) => {
    const tasks = queryClient.getQueryData<Task[]>(taskKeys.all) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      updateMutation.mutate({
        id: taskId,
        updates: { starred: !task.starred }
      });
    }
  };
};