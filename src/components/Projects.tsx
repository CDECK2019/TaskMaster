import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useIconTheme } from '../contexts/IconThemeContext';
import { formatDate } from '../utils/data';

const Projects: React.FC = () => {
  const { projects, loading, createProject, updateProject, deleteProject, createWorkstream } = useProjects();
  const { icons } = useIconTheme();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingProjectData, setEditingProjectData] = useState<any>(null);
  const [showWorkstreamForm, setShowWorkstreamForm] = useState<string | null>(null);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [newWorkstreamTitle, setNewWorkstreamTitle] = useState('');
  const [newProject, setNewProject] = useState({ title: '', description: '', color: 'bg-blue-500' });

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-gray-500'
  ];

  const handleCreateProject = async () => {
    if (newProject.title.trim()) {
      try {
        await createProject(newProject);
        setNewProject({ title: '', description: '', color: 'bg-blue-500' });
        setShowCreateForm(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleUpdateProject = async (id: string, updates: any) => {
    try {
      await updateProject(id, updates);
      setEditingProject(null);
      setEditingProjectData(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const startEditingProject = (project: any) => {
    setEditingProject(project.id);
    setEditingProjectData({
      title: project.title,
      description: project.description || '',
      color: project.color
    });
    setShowProjectMenu(null);
  };

  const cancelEditingProject = () => {
    setEditingProject(null);
    setEditingProjectData(null);
  };

  const saveProjectChanges = async () => {
    if (editingProject && editingProjectData) {
      await handleUpdateProject(editingProject, editingProjectData);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? All workstreams and tasks in this project will also be deleted.')) {
      try {
        await deleteProject(id);
        setShowProjectMenu(null);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleCreateWorkstream = async (projectId: string) => {
    if (newWorkstreamTitle.trim()) {
      try {
        await createWorkstream(projectId, newWorkstreamTitle.trim());
        setNewWorkstreamTitle('');
        setShowWorkstreamForm(null);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-300">Organize your work into projects with workstreams and tasks</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <icons.add className="w-5 h-5" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Project</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <icons.close className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter project title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Enter project description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProject({ ...newProject, color })}
                    className={`w-8 h-8 rounded-full ${color} ${
                      newProject.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                  {editingProject === project.id ? (
                    <input
                      type="text"
                      value={editingProjectData?.title || ''}
                      onChange={(e) => setEditingProjectData({ ...editingProjectData, title: e.target.value })}
                      className="text-lg font-semibold bg-transparent border-b border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                  )}
                </div>
                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setShowProjectMenu(showProjectMenu === project.id ? null : project.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <icons.more className="w-5 h-5" />
                  </button>
                  
                  {/* Project Menu */}
                  {showProjectMenu === project.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                      <div className="py-1">
                        <button
                          onClick={() => startEditingProject(project)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <icons.edit className="w-4 h-4" />
                          <span>Edit Project</span>
                        </button>
                        <button
                          onClick={() => setShowWorkstreamForm(project.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <icons.add className="w-4 h-4" />
                          <span>Add Workstream</span>
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                        >
                          <icons.delete className="w-4 h-4" />
                          <span>Delete Project</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {editingProject === project.id ? (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editingProjectData?.description || ''}
                      onChange={(e) => setEditingProjectData({ ...editingProjectData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={3}
                      placeholder="Enter project description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                    <div className="flex space-x-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditingProjectData({ ...editingProjectData, color })}
                          className={`w-6 h-6 rounded-full ${color} ${
                            editingProjectData?.color === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEditingProject}
                      className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProjectChanges}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                project.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{project.description}</p>
                )
              )}
              
              <div className="space-y-3">
                {editingProject !== project.id && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <icons.workflow className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-300">{project.workstreamCount} workstreams</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <icons.completed className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-300">{project.taskCount || 0} tasks</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {project.taskCount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {Math.round(((project.completedCount || 0) / project.taskCount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${project.color}`}
                            style={{ width: `${Math.round(((project.completedCount || 0) / project.taskCount) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Workstreams List */}
                    {project.workstreams && project.workstreams.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Workstreams</h4>
                          <button
                            onClick={() => setShowWorkstreamForm(project.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {project.workstreams.map((workstream) => (
                            <div key={workstream.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                              <div className="flex items-center space-x-2">
                                <icons.layers className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{workstream.title}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                                {workstream.taskCount || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add Workstream Form */}
                    {showWorkstreamForm === project.id ? (
                      <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <input
                          type="text"
                          value={newWorkstreamTitle}
                          onChange={(e) => setNewWorkstreamTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          placeholder="Workstream title..."
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkstream(project.id)}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowWorkstreamForm(null)}
                            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCreateWorkstream(project.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                          >
                            Add Workstream
                          </button>
                        </div>
                      </div>
                    ) : (
                      project.workstreams && project.workstreams.length === 0 && (
                        <button
                          onClick={() => setShowWorkstreamForm(project.id)}
                          className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <icons.add className="w-4 h-4" />
                          <span className="text-sm">Add first workstream</span>
                        </button>
                      )
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-1">
                        <icons.calendar className="w-4 h-4" />
                        <span>Created {formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <icons.users className="w-4 h-4" />
                        <span>Personal</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <icons.folder className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first project to start organizing your work</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}
    </div>
  );

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProjectMenu && !(event.target as Element).closest('.relative')) {
        setShowProjectMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectMenu]);
};

export default Projects;