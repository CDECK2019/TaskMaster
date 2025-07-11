import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { List } from '../types';
import toast from 'react-hot-toast';

export const useLists = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select(`
          *,
          tasks(id, completed)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const listsWithCounts = data.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description || '',
        color: list.color,
        createdAt: list.created_at.split('T')[0],
        taskCount: list.tasks?.length || 0,
        completedCount: list.tasks?.filter((task: any) => task.completed).length || 0
      }));

      setLists(listsWithCounts);
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const createList = async (listData: Omit<List, 'id' | 'createdAt' | 'taskCount' | 'completedCount'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('lists')
        .insert({
          title: listData.title,
          description: listData.description,
          color: listData.color,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newList: List = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        color: data.color,
        createdAt: data.created_at.split('T')[0],
        taskCount: 0,
        completedCount: 0
      };

      setLists(prev => [newList, ...prev]);
      toast.success('List created successfully');
      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
      throw error;
    }
  };

  const updateList = async (id: string, updates: Partial<List>) => {
    try {
      const { error } = await supabase
        .from('lists')
        .update({
          title: updates.title,
          description: updates.description,
          color: updates.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setLists(prev => prev.map(list => 
        list.id === id ? { ...list, ...updates } : list
      ));
      toast.success('List updated successfully');
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
      throw error;
    }
  };

  const deleteList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLists(prev => prev.filter(list => list.id !== id));
      toast.success('List deleted successfully');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
      throw error;
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    refetch: fetchLists
  };
};