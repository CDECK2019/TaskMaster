import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useIconTheme } from '../contexts/IconThemeContext';
import { getProgressPercentage, formatDate, getPriorityColor } from '../utils/data';
import TaskEditModal from './TaskEditModal';

const Dashboard: React.FC = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { updateTask, deleteTask } = useTasks();
  const { icons } = useIconTheme();
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const starredTasks = tasks.filter(task => task.starred);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && !task.completed;
  }).length;
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date().toDateString();
    return new Date(task.dueDate).toDateString() === today;
  }).length;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: icons.target,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Priority Tasks',
      value: starredTasks.length,
      icon: icons.starred,
      color: 'bg-yellow-500',
      change: '+2%'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: icons.completed,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Due Today',
      value: todayTasks,
      icon: icons.calendar,
      color: 'bg-purple-500',
      change: '+3%'
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: icons.clock,
      color: 'bg-red-500',
      change: '-5%'
    }
  ];

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const editingTaskData = editingTask ? tasks.find(t => t.id === editingTask) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's your productivity overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <icons.users className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Personal workspace</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <icons.trending className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Tasks */}
        {starredTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <icons.starred className="w-5 h-5 text-yellow-500 fill-current" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Tasks</h3>
            </div>
            <div className="space-y-3">
              {starredTasks.slice(0, 5).map((task) => {
                const project = projects.find(p => p.id === task.listId);
                return (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <icons.starred className="w-4 h-4 text-yellow-500 fill-current" />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600">{project?.title || 'Unknown Project'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.completed ? 'Completed' : 'In Progress'}
                        </span>
                      <button
                        onClick={() => setEditingTask(task.id)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <icons.edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Overview */}
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${starredTasks.length === 0 ? 'lg:col-span-2' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Overview</h3>
          <div className="space-y-4">
            {projects.map((project) => {
              const progress = getProgressPercentage(project.completedCount || 0, project.taskCount || 0);
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{project.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({project.workstreamCount} workstreams)</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${starredTasks.length === 0 ? 'lg:col-span-2' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => {
              const project = projects.find(p => p.id === task.listId);
              return (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{project?.title || 'Unknown Project'}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {task.completed ? 'Completed' : 'In Progress'}
                  </span>
                  <button
                    onClick={() => setEditingTask(task.id)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <icons.edit className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTaskData && (
        <TaskEditModal
          task={editingTaskData}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default Dashboard;