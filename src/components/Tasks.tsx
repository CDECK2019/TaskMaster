import React, { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask, useToggleStarred } from '../hooks/useTasksQuery';
import { useLists } from '../hooks/useLists';
import { useIconTheme } from '../contexts/IconThemeContext';
import { formatDate, getPriorityColor } from '../utils/data';
import { getStatusColor, getStatusLabel } from '../utils/data';
import { ui } from '../styles/theme';
import TaskEditModal from './TaskEditModal';
import IconButton from './ui/IconButton';

const Tasks: React.FC = () => {
  const { data: tasks = [], isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleTask = useToggleTask();
  const toggleStarred = useToggleStarred();
  const { lists } = useLists();
  const { icons } = useIconTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'review' | 'done',
    dueDate: '',
    listId: '',
    workstreamId: '',
    assignee: '',
    tags: [] as string[]
  });

  // Separate starred and regular tasks
  const starredTasks = tasks.filter(task => task.starred);
  const regularTasks = tasks.filter(task => !task.starred);

  const filteredTasks = tasks.filter(task => {
    if (showStarredOnly && !task.starred) return false;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getListName = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    return list ? list.title : 'Unknown List';
  };

  const getListColor = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    return list ? list.color : 'bg-gray-500';
  };

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleCreateTask = async () => {
    if (newTask.title.trim() && newTask.listId) {
      try {
        await createTaskMutation.mutateAsync({
          ...newTask,
          completed: false,
          workstreamId: newTask.workstreamId || undefined,
          dueDate: newTask.dueDate || undefined
        });
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          dueDate: '',
          listId: '',
          workstreamId: '',
          assignee: '',
          tags: []
        });
        setShowCreateForm(false);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const editingTaskData = editingTask ? tasks.find(t => t.id === editingTask) : null;

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 dark:text-red-400">
        Error loading tasks: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={ui.spinner} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600">Manage and track all your tasks in one place</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className={ui.button.primary}
        >
          <icons.add className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className={ui.card + " p-6"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
             <icons.close className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Task Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className={ui.input}
                placeholder="Enter task title..."
              />
            </div>
            <div>
              <label className={ui.label}>List</label>
              <select
                value={newTask.listId}
                onChange={(e) => setNewTask({ ...newTask, listId: e.target.value })}
                className={ui.select}
              >
                <option value="">Select a list</option>
                {lists.map(list => (
                  <option key={list.id} value={list.id}>{list.title}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={ui.label}>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className={ui.textarea}
                rows={3}
                placeholder="Enter task description..."
              />
            </div>
            <div>
              <label className={ui.label}>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className={ui.select}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={ui.label}>Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as 'todo' | 'in_progress' | 'review' | 'done' })}
                className={ui.select}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className={ui.label}>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className={ui.input}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className={ui.button.secondary}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className={ui.button.primary}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={ui.card + " p-6"}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={ui.input + " pl-10"}
              placeholder="Search tasks..."
            />
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showStarredOnly}
                onChange={(e) => setShowStarredOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Starred only</span>
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={ui.select}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={ui.select}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Priority Tasks Section */}
      {starredTasks.length > 0 && !showStarredOnly && (
        <div className={ui.card}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Tasks</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                  {starredTasks.length} starred
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {starredTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors border border-yellow-200 dark:border-yellow-800">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <icons.completed className="w-6 h-6 text-green-500" />
                    ) : (
                      <icons.pending className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => toggleStarred(task.id)}
                    className="flex-shrink-0"
                  >
                    <icons.starred className="w-5 h-5 text-yellow-500 fill-current hover:text-yellow-600" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getListColor(task.listId)}`}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{getListName(task.listId)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status || 'todo')}`}>
                              {getStatusLabel(task.status || 'todo')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status || 'todo')}`}>
                              {getStatusLabel(task.status || 'todo')}
                            </span>
                          </div>
                          
                          {task.dueDate && (
                            <div className="flex items-center space-x-1">
                              <icons.calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(task.dueDate)}</span>
                            </div>
                          )}
                          
                          {task.assignee && (
                            <div className="flex items-center space-x-1">
                              <icons.user className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{task.assignee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button
                          onClick={() => setEditingTask(task.id)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <icons.edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Tasks List */}
      <div className={ui.card}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {showStarredOnly ? 'Starred Tasks' : 'All Tasks'} ({filteredTasks.length})
            </h3>
            <div className="flex items-center space-x-2">
             <icons.filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Sorted by due date</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className={`flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-100 transition-colors ${
                task.starred ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700'
              }`}>
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0"
                  aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  <IconButton
                    variant={task.completed ? "complete" : "incomplete"}
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    size="md"
                  />
                </button>
                
                <button
                  onClick={() => toggleStarred(task.id)}
                  className="flex-shrink-0"
                  aria-label={task.starred ? "Remove from priority" : "Mark as priority"}
                >
                  <icons.starred className={`w-5 h-5 ${
                    task.starred 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getListColor(task.listId)}`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{getListName(task.listId)}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <icons.calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        
                        {task.assignee && (
                          <div className="flex items-center space-x-1">
                            <icons.user className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{task.assignee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => setEditingTask(task.id)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <icons.edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTaskData && (
        <TaskEditModal
          task={editingTaskData}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(taskId, updates) => updateTaskMutation.mutate({ id: taskId, updates })}
          onDelete={(taskId) => deleteTaskMutation.mutate(taskId)}
        />
      )}
    </div>
  );
};

export default Tasks;