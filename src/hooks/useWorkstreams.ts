import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Workstream, WorkstreamColumn } from '../types';
import toast from 'react-hot-toast';

interface WorkstreamTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  columnId: string;
  position: number;
  createdAt: string;
}

interface DatabaseWorkstream {
  id: string;
  title: string;
  position: number;
  created_at: string;
  workstream_columns: Array<{
    id: string;
    title: string;
    color: string;
    position: number;
    workstream_tasks: Array<{
      id: string;
      title: string;
      description?: string;
      priority: 'low' | 'medium' | 'high';
      due_date?: string;
      tags?: string[];
      position: number;
      created_at: string;
    }>;
  }>;
}

export const useWorkstreams = () => {
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkstreams = async () => {
    try {
      const { data, error } = await supabase
        .from('workstreams')
        .select(`
          *,
          projects (
            id,
            title,
            color
          ),
          workstream_columns (
            *,
            workstream_tasks (*)
          )
        `)
        .order('position', { ascending: true });

      if (error) throw error;

      const formattedWorkstreams: Workstream[] = (data as DatabaseWorkstream[]).map(workstream => ({
        id: workstream.id,
        title: workstream.title,
        projectId: workstream.project_id || undefined,
        columns: workstream.workstream_columns
          .sort((a, b) => a.position - b.position)
          .map(column => ({
            id: column.id,
            title: column.title,
            color: column.color,
            tasks: column.workstream_tasks
              .sort((a, b) => a.position - b.position)
              .map(task => ({
                id: task.id,
                title: task.title,
                description: task.description || '',
                completed: false, // Workstream tasks don't have completed status
                priority: task.priority,
                dueDate: task.due_date,
                createdAt: task.created_at.split('T')[0],
                listId: '', // Not applicable for workstream tasks
                tags: task.tags || [],
                starred: task.starred || false
              }))
          }))
      }));

      setWorkstreams(formattedWorkstreams);
    } catch (error) {
      console.error('Error fetching workstreams:', error);
      toast.error('Failed to load workstreams');
    } finally {
      setLoading(false);
    }
  };

  const createWorkstream = async (title: string, projectId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the current max position
      const { data: existingWorkstreams } = await supabase
        .from('workstreams')
        .select('position')
        .eq(projectId ? 'project_id' : 'user_id', projectId || user.id)
        .order('position', { ascending: false })
        .limit(1);

      const newPosition = existingWorkstreams && existingWorkstreams.length > 0 
        ? existingWorkstreams[0].position + 1 
        : 0;

      // Create the workstream
      const { data: workstreamData, error: workstreamError } = await supabase
        .from('workstreams')
        .insert({
          title,
          project_id: projectId || null,
          position: newPosition,
          user_id: user.id
        })
        .select()
        .single();

      if (workstreamError) throw workstreamError;

      // Create default columns
      const defaultColumns = [
        { title: 'Key Decisions', color: 'bg-purple-100', position: 0 },
        { title: 'To Do', color: 'bg-gray-100', position: 1 },
        { title: 'In Progress', color: 'bg-blue-100', position: 2 },
        { title: 'Review', color: 'bg-yellow-100', position: 3 },
        { title: 'Done', color: 'bg-green-100', position: 4 }
      ];

      const { data: columnsData, error: columnsError } = await supabase
        .from('workstream_columns')
        .insert(
          defaultColumns.map(col => ({
            title: col.title,
            color: col.color,
            position: col.position,
            workstream_id: workstreamData.id
          }))
        )
        .select();

      if (columnsError) throw columnsError;

      const newWorkstream: Workstream = {
        id: workstreamData.id,
        title: workstreamData.title,
        projectId: workstreamData.project_id || undefined,
        columns: columnsData.map(col => ({
          id: col.id,
          title: col.title,
          color: col.color,
          tasks: []
        }))
      };

      setWorkstreams(prev => [...prev, newWorkstream]);
      toast.success('Workstream created successfully');
      return newWorkstream;
    } catch (error) {
      console.error('Error creating workstream:', error);
      toast.error('Failed to create workstream');
      throw error;
    }
  };

  const updateWorkstream = async (id: string, updates: { title?: string }) => {
    try {
      const { error } = await supabase
        .from('workstreams')
        .update({
          title: updates.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setWorkstreams(prev => prev.map(workstream => 
        workstream.id === id ? { ...workstream, ...updates } : workstream
      ));
      toast.success('Workstream updated successfully');
    } catch (error) {
      console.error('Error updating workstream:', error);
      toast.error('Failed to update workstream');
      throw error;
    }
  };

  const deleteWorkstream = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workstreams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkstreams(prev => prev.filter(workstream => workstream.id !== id));
      toast.success('Workstream deleted successfully');
    } catch (error) {
      console.error('Error deleting workstream:', error);
      toast.error('Failed to delete workstream');
      throw error;
    }
  };

  const reorderWorkstreams = async (draggedWorkstreamId: string, targetIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a new array with the reordered workstreams
      const reorderedWorkstreams = [...workstreams];
      const draggedIndex = reorderedWorkstreams.findIndex(w => w.id === draggedWorkstreamId);
      const [draggedWorkstream] = reorderedWorkstreams.splice(draggedIndex, 1);
      reorderedWorkstreams.splice(targetIndex, 0, draggedWorkstream);

      // Update positions in database
      const updates = reorderedWorkstreams.map((workstream, index) => ({
        id: workstream.id,
        position: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('workstreams')
          .update({ position: update.position })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Update local state
      setWorkstreams(reorderedWorkstreams);
      toast.success('Workstreams reordered successfully');
    } catch (error) {
      console.error('Error reordering workstreams:', error);
      toast.error('Failed to reorder workstreams');
      throw error;
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, targetColumnId: string, workstreamId: string) => {
    try {
      // Get the target column title to determine the status
      const { data: targetColumnData, error: columnError } = await supabase
        .from('workstream_columns')
        .select('title')
        .eq('id', targetColumnId)
        .single();

      if (columnError) throw columnError;

      // Map column titles to status values
      const statusMap: Record<string, string> = {
        'To Do': 'todo',
        'In Progress': 'in_progress',
        'Review': 'review',
        'Done': 'done'
      };

      const newStatus = statusMap[targetColumnData.title] || 'todo';

      // Update task's column_id in workstream_tasks database
      const { error } = await supabase
        .from('workstream_tasks')
        .update({ column_id: targetColumnId })
        .eq('id', taskId);

      if (error) throw error;

      // Update the corresponding task in the main tasks table with new status
      const workstreamTask = workstreams
        .flatMap(w => w.columns)
        .flatMap(c => c.tasks)
        .find(t => t.id === taskId);

      if (workstreamTask) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('tasks')
            .update({ 
              status: newStatus,
              completed: newStatus === 'done'
            })
            .eq('title', workstreamTask.title)
            .eq('user_id', user.id);
        }
      }

      // Also update the corresponding task in the main tasks table if it exists
      // We'll find it by matching title and other properties since we don't store the relationship
        // Get the target column info to update the list association
        const { data: targetColumnInfo, error: targetColumnInfoError } = await supabase
          .from('workstream_columns')
          .select(`
            *,
            workstreams (
              id,
              title
            )
          `)
          .eq('id', targetColumnId)
          .single();

        if (!targetColumnInfoError && targetColumnInfo && workstreamTask) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const workstreamListTitle = `Workstream: ${targetColumnInfo.workstreams.title}`;
            
            // Find or create the target list
            let targetListId: string;
            const { data: existingList } = await supabase
              .from('lists')
              .select('id')
              .eq('title', workstreamListTitle)
              .eq('user_id', user.id)
              .single();

            if (existingList) {
              targetListId = existingList.id;
            } else {
              const { data: newList } = await supabase
                .from('lists')
                .insert({
                  title: workstreamListTitle,
                  description: `Tasks from ${targetColumnInfo.workstreams.title} workstream`,
                  color: 'bg-indigo-500',
                  user_id: user.id
                })
                .select('id')
                .single();
              
              if (newList) targetListId = newList.id;
            }

            // Update the main task's list_id if we found/created a target list
            if (targetListId) {
              await supabase
                .from('tasks')
                .update({ list_id: targetListId })
                .eq('title', workstreamTask.title)
                .eq('user_id', user.id);
            }
          }
        }

      // Update local state
      setWorkstreams(prevWorkstreams => 
        prevWorkstreams.map(workstream => {
          if (workstream.id !== workstreamId) return workstream;
          
          let movedTask: any = null;
          
          return {
            ...workstream,
            columns: workstream.columns.map(column => {
              if (column.id === sourceColumnId) {
                // Remove task from source column
                const taskIndex = column.tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                  movedTask = column.tasks[taskIndex];
                  return {
                    ...column,
                    tasks: column.tasks.filter(task => task.id !== taskId)
                  };
                }
              } else if (column.id === targetColumnId && movedTask) {
                // Add task to target column
                return {
                  ...column,
                  tasks: [...column.tasks, movedTask]
                };
              }
              return column;
            })
          };
        })
      );

      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
      throw error;
    }
  };

  const createTask = async (columnId: string, taskData: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    tags?: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the current number of tasks in the column to set position
      const column = workstreams
        .flatMap(w => w.columns)
        .find(c => c.id === columnId);
      
      const position = column ? column.tasks.length : 0;

      // First, create the workstream task
      const { data: workstreamTaskData, error: workstreamError } = await supabase
        .from('workstream_tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          tags: taskData.tags,
          column_id: columnId,
          position,
          starred: taskData.starred || false
        })
        .select()
        .single();

      if (workstreamError) throw workstreamError;

      // Get the workstream info to create a corresponding list if needed
      const { data: columnData, error: columnError } = await supabase
        .from('workstream_columns')
        .select(`
          *,
          workstreams (
            id,
            title
          )
        `)
        .eq('id', columnId)
        .single();

      if (columnError) throw columnError;

      // Create or find a list for this workstream
      let listId: string;
      const workstreamListTitle = `Workstream: ${columnData.workstreams.title}`;
      
      const { data: existingList, error: listSearchError } = await supabase
        .from('lists')
        .select('id')
        .eq('title', workstreamListTitle)
        .eq('user_id', user.id)
        .maybeSingle();

      if (listSearchError) {
        throw listSearchError;
      }

      if (existingList) {
        listId = existingList.id;
      } else {
        // Create a new list for this workstream
        const { data: newList, error: listCreateError } = await supabase
          .from('lists')
          .insert({
            title: workstreamListTitle,
            description: `Tasks from ${columnData.workstreams.title} workstream`,
            color: 'bg-indigo-500',
            user_id: user.id
          })
          .select('id')
          .single();

        if (listCreateError) throw listCreateError;
        listId = newList.id;
      }

      // Create the corresponding task in the main tasks table
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          completed: false,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          list_id: listId,
          tags: taskData.tags,
          user_id: user.id,
          starred: taskData.starred || false
        });

      if (taskError) throw taskError;

      const newTask = {
        id: workstreamTaskData.id,
        title: workstreamTaskData.title,
        description: workstreamTaskData.description || '',
        completed: false,
        priority: workstreamTaskData.priority,
        dueDate: workstreamTaskData.due_date,
        createdAt: workstreamTaskData.created_at.split('T')[0],
        listId: '',
        tags: workstreamTaskData.tags || [],
        starred: workstreamTaskData.starred || false
      };

      // Update local state
      setWorkstreams(prev => prev.map(workstream => ({
        ...workstream,
        columns: workstream.columns.map(column => 
          column.id === columnId 
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        )
      })));

      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkstreams();
  }, []);

  return {
    workstreams,
    loading,
    createWorkstream,
    updateWorkstream,
    deleteWorkstream,
    reorderWorkstreams,
    moveTask,
    createTask,
    refetch: fetchWorkstreams
  };

  const updateWorkstreamTask = async (taskId: string, updates: Partial<any>) => {
    try {
      const { error } = await supabase
        .from('workstream_tasks')
        .update({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          due_date: updates.dueDate,
          tags: updates.tags,
          starred: updates.starred
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setWorkstreams(prev => prev.map(workstream => ({
        ...workstream,
        columns: workstream.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        }))
      })));

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating workstream task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteWorkstreamTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('workstream_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setWorkstreams(prev => prev.map(workstream => ({
        ...workstream,
        columns: workstream.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        }))
      })));

      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting workstream task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  const toggleTaskStarred = async (taskId: string) => {
    try {
      // Find the task in workstreams
      let targetTask: any = null;
      let targetWorkstream: any = null;
      let targetColumn: any = null;

      for (const workstream of workstreams) {
        for (const column of workstream.columns) {
          const task = column.tasks.find(t => t.id === taskId);
          if (task) {
            targetTask = task;
            targetWorkstream = workstream;
            targetColumn = column;
            break;
          }
        }
        if (targetTask) break;
      }

      if (!targetTask) return;

      const newStarredState = !targetTask.starred;

      // Update in workstream_tasks table
      const { error } = await supabase
        .from('workstream_tasks')
        .update({ starred: newStarredState })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setWorkstreams(prev => prev.map(workstream => 
        workstream.id === targetWorkstream.id
          ? {
              ...workstream,
              columns: workstream.columns.map(column =>
                column.id === targetColumn.id
                  ? {
                      ...column,
                      tasks: column.tasks.map(task =>
                        task.id === taskId
                          ? { ...task, starred: newStarredState }
                          : task
                      )
                    }
                  : column
              )
            }
          : workstream
      ));

      toast.success(newStarredState ? 'Task starred' : 'Task unstarred');
    } catch (error) {
      console.error('Error toggling task starred status:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  return {
    workstreams,
    loading,
    createWorkstream,
    updateWorkstream,
    deleteWorkstream,
    reorderWorkstreams,
    moveTask,
    createTask,
    toggleTaskStarred,
    updateWorkstreamTask,
    deleteWorkstreamTask,
    refetch: fetchWorkstreams
  };
};