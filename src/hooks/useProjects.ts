import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          workstreams(
            id,
            title,
            workstream_columns(
              workstream_tasks(id)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCounts = data.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        color: project.color,
        createdAt: project.created_at.split('T')[0],
        workstreamCount: project.workstreams?.length || 0,
        taskCount: project.workstreams?.reduce((total: number, ws: any) => 
          total + (ws.workstream_columns?.reduce((colTotal: number, col: any) => 
            colTotal + (col.workstream_tasks?.length || 0), 0) || 0), 0) || 0,
        completedCount: 0, // We'll calculate this separately if needed
        workstreams: project.workstreams?.map((ws: any) => ({
          id: ws.id,
          title: ws.title,
          projectId: project.id,
          columns: [],
          taskCount: ws.workstream_columns?.reduce((colTotal: number, col: any) => 
            colTotal + (col.workstream_tasks?.length || 0), 0) || 0
        })) || []
      }));

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'workstreamCount' | 'taskCount' | 'completedCount'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          color: projectData.color,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create a default workstream for the new project
      const { data: workstreamData, error: workstreamError } = await supabase
        .from('workstreams')
        .insert({
          title: `${projectData.title} - Main Workstream`,
          project_id: data.id,
          user_id: user.id,
          position: 0
        })
        .select()
        .single();

      if (workstreamError) throw workstreamError;

      // Create default columns for the workstream
      const defaultColumns = [
        { title: 'To Do', color: 'bg-gray-100', position: 0 },
        { title: 'In Progress', color: 'bg-blue-100', position: 1 },
        { title: 'Review', color: 'bg-yellow-100', position: 2 },
        { title: 'Done', color: 'bg-green-100', position: 3 }
      ];

      await supabase
        .from('workstream_columns')
        .insert(
          defaultColumns.map(col => ({
            title: col.title,
            color: col.color,
            position: col.position,
            workstream_id: workstreamData.id
          }))
        );

      const newProject: Project = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        color: data.color,
        createdAt: data.created_at.split('T')[0],
        workstreamCount: 1,
        taskCount: 0,
        completedCount: 0,
        workstreams: [{
          id: workstreamData.id,
          title: workstreamData.title,
          projectId: data.id,
          columns: [],
          taskCount: 0
        }]
      };

      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created successfully');
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          color: updates.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      ));
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  };

  const createWorkstream = async (projectId: string, title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the current max position for workstreams in this project
      const { data: existingWorkstreams } = await supabase
        .from('workstreams')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1);

      const newPosition = existingWorkstreams && existingWorkstreams.length > 0 
        ? existingWorkstreams[0].position + 1 
        : 0;

      const { data: workstreamData, error: workstreamError } = await supabase
        .from('workstreams')
        .insert({
          title,
          project_id: projectId,
          user_id: user.id,
          position: newPosition
        })
        .select()
        .single();

      if (workstreamError) throw workstreamError;

      // Create default columns for the workstream
      const defaultColumns = [
        { title: 'To Do', color: 'bg-gray-100', position: 0 },
        { title: 'In Progress', color: 'bg-blue-100', position: 1 },
        { title: 'Review', color: 'bg-yellow-100', position: 2 },
        { title: 'Done', color: 'bg-green-100', position: 3 }
      ];

      await supabase
        .from('workstream_columns')
        .insert(
          defaultColumns.map(col => ({
            title: col.title,
            color: col.color,
            position: col.position,
            workstream_id: workstreamData.id
          }))
        );

      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              workstreamCount: project.workstreamCount + 1,
              workstreams: [
                ...(project.workstreams || []),
                {
                  id: workstreamData.id,
                  title: workstreamData.title,
                  projectId,
                  columns: [],
                  taskCount: 0
                }
              ]
            }
          : project
      ));

      toast.success('Workstream created successfully');
      return workstreamData;
    } catch (error) {
      console.error('Error creating workstream:', error);
      toast.error('Failed to create workstream');
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    createWorkstream,
    refetch: fetchProjects
  };
};