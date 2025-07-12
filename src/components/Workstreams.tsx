import React, { useState } from 'react';
import { useWorkstreams } from '../hooks/useWorkstreams';
import { useProjects } from '../hooks/useProjects';
import { useIconTheme } from '../contexts/IconThemeContext';
import { formatDate, getPriorityColor } from '../utils/data';
import TaskEditModal from './TaskEditModal';
import IconButton from './ui/IconButton';

const Workstreams: React.FC = () => {
  const { workstreams, loading, createWorkstream, deleteWorkstream, moveTask, createTask, reorderWorkstreams, toggleTaskStarred, updateWorkstreamTask, deleteWorkstreamTask } = useWorkstreams();
  const { projects } = useProjects();
  const { icons } = useIconTheme();
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [draggedWorkstream, setDraggedWorkstream] = useState<string | null>(null);
  const [dragOverWorkstream, setDragOverWorkstream] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newWorkstream, setNewWorkstream] = useState({ title: '', projectId: '' });
  const [showTaskForm, setShowTaskForm] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: [] as string[]
  });

  // Task drag handlers
  const handleTaskDragStart = (e: React.DragEvent, task: any, sourceColumnId: string) => {
    setDraggedTask({ ...task, sourceColumnId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'task');
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = async (e: React.DragEvent, targetColumnId: string, workstreamId: string) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }
    
    try {
      await moveTask(draggedTask.id, draggedTask.sourceColumnId, targetColumnId, workstreamId);
    } catch (error) {
      // Error handled in hook
    }
    
    setDraggedTask(null);
  };

  // Workstream drag handlers
  const handleWorkstreamDragStart = (e: React.DragEvent, workstreamId: string) => {
    setDraggedWorkstream(workstreamId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'workstream');
    
    // Add some visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleWorkstreamDragOver = (e: React.DragEvent, workstreamId: string) => {
    e.preventDefault();
    if (draggedWorkstream && draggedWorkstream !== workstreamId) {
      setDragOverWorkstream(workstreamId);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleWorkstreamDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the workstream container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverWorkstream(null);
    }
  };

  const handleWorkstreamDrop = async (e: React.DragEvent, targetWorkstreamId: string) => {
    e.preventDefault();
    setDragOverWorkstream(null);
    
    if (!draggedWorkstream || draggedWorkstream === targetWorkstreamId) {
      setDraggedWorkstream(null);
      return;
    }

    const draggedIndex = workstreams.findIndex(w => w.id === draggedWorkstream);
    const targetIndex = workstreams.findIndex(w => w.id === targetWorkstreamId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedWorkstream(null);
      return;
    }

    try {
      await reorderWorkstreams(draggedWorkstream, targetIndex);
    } catch (error) {
      // Error handled in hook
    }
    
    setDraggedWorkstream(null);
  };

  const handleWorkstreamDragEnd = () => {
    setDraggedWorkstream(null);
    setDragOverWorkstream(null);
  };

  const handleCreateWorkstream = async () => {
    if (newWorkstream.title.trim() && newWorkstream.projectId) {
      try {
        await createWorkstream(newWorkstream.title.trim(), newWorkstream.projectId);
        setNewWorkstream({ title: '', projectId: '' });
        setShowCreateForm(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleDeleteWorkstream = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workstream? All columns and tasks will be permanently deleted.')) {
      try {
        await deleteWorkstream(id);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleCreateTask = async (columnId: string) => {
    if (newTask.title.trim()) {
      try {
        await createTask(columnId, {
          ...newTask,
          dueDate: newTask.dueDate || undefined
        });
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          tags: []
        });
        setShowTaskForm(null);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleEditTask = async (taskId: string, updates: Partial<any>) => {
    await updateWorkstreamTask(taskId, updates);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteWorkstreamTask(taskId);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workstreams</h1>
          <p className="text-gray-600 dark:text-gray-300">Visual workflow management with drag-and-drop</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <icons.add className="w-5 h-5" />
          <span>New Workstream</span>
        </button>
      </div>

      {/* Create Workstream Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Workstream</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <icons.close className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</label>
              <select
                value={newWorkstream.projectId}
                onChange={(e) => setNewWorkstream({ ...newWorkstream, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workstream Title</label>
              <input
                type="text"
                value={newWorkstream.title}
                onChange={(e) => setNewWorkstream({ ...newWorkstream, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter workstream title..."
                onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkstream()}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkstream}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Workstream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workstreams */}
      {workstreams.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <icons.add className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workstreams yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first workstream to start organizing your workflow</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Workstream
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {workstreams.map((workstream, index) => (
            <div
              key={workstream.id}
              draggable
              onDragStart={(e) => handleWorkstreamDragStart(e, workstream.id)}
              onDragOver={(e) => handleWorkstreamDragOver(e, workstream.id)}
              onDragLeave={handleWorkstreamDragLeave}
              onDrop={(e) => handleWorkstreamDrop(e, workstream.id)}
              onDragEnd={handleWorkstreamDragEnd}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-move ${
                draggedWorkstream === workstream.id 
                  ? 'border-blue-400 dark:border-blue-500 shadow-lg opacity-50 transform rotate-2' 
                  : dragOverWorkstream === workstream.id
                  ? 'border-blue-400 dark:border-blue-500 shadow-lg transform scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{
                backgroundColor: draggedWorkstream === workstream.id || dragOverWorkstream === workstream.id 
                  ? undefined 
                  : 'var(--workstream-bg, white)'
              }}
            >
              <style>
                {`:root { --workstream-bg: white; } .dark { --workstream-bg: rgb(31 41 55); }`}
              </style>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      <icons.grip className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workstream.title}</h3>
                      {workstream.projectId && (
                        <div className="flex items-center space-x-2 mt-1">
                          <icons.folder className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {projects.find(p => p.id === workstream.projectId)?.title || 'Unknown Project'}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {workstream.columns.reduce((total, col) => total + col.tasks.length, 0)} tasks
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkstream(workstream.id);
                      }}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <icons.delete className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <icons.more className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {workstream.columns.map((column) => (
                    <div
                      key={column.id}
                      className={`${column.color} dark:bg-opacity-20 rounded-lg p-4 min-h-[400px] border border-gray-200 dark:border-gray-600`}
                      onDragOver={handleTaskDragOver}
                      onDrop={(e) => handleTaskDrop(e, column.id, workstream.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{column.title}</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                          {column.tasks.length}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {column.tasks.map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleTaskDragStart(e, task, column.id)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start space-x-2 flex-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskStarred(task.id);
                                  }}
                                  className="flex-shrink-0 mt-0.5"
                                  aria-label={task.starred ? "Remove from priority" : "Mark as priority"}
                                >
                                  <icons.starred className={`w-4 h-4 ${
                                    task.starred 
                                      ? 'text-yellow-500 fill-current' 
                                      : 'text-gray-300 hover:text-yellow-400'
                                  }`} />
                                </button>
                                <h5 className={`font-medium text-sm flex-1 ${
                                  task.starred ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.title}
                                </h5>
                              </div>
                              <div className="flex items-center space-x-1">
                                {task.starred && (
                                  <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full"></div>
                                )}
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                  <icons.more className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(task.id);
                                  }}
                                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  aria-label="Edit task"
                                >
                                  <IconButton
                                    variant="edit"
                                    onClick={() => setEditingTask(task.id)}
                                    aria-label="Edit task"
                                    size="sm"
                                  />
                                </button>
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                            
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Add Task Form */}
                        {showTaskForm === column.id ? (
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-sm">
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="Task title..."
                              />
                              <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                rows={2}
                                placeholder="Description..."
                              />
                              <div className="flex space-x-2">
                                <select
                                  value={newTask.priority}
                                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                <input
                                  type="date"
                                  value={newTask.dueDate}
                                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setShowTaskForm(null)}
                                  className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleCreateTask(column.id)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                                >
                                  Add Task
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowTaskForm(column.id)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-center space-x-2"
                          >
                            <icons.add className="w-4 h-4" />
                            <span className="text-sm">Add task</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskEditModal
          task={workstreams.flatMap(w => w.columns).flatMap(c => c.tasks).find(t => t.id === editingTask)!}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default Workstreams;