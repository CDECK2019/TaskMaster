import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Users,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';
import { useLists } from '../hooks/useLists';
import { getProgressPercentage } from '../utils/data';

const Lists: React.FC = () => {
  const { lists, loading, createList, updateList, deleteList } = useLists();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [newList, setNewList] = useState({ title: '', description: '', color: 'bg-blue-500' });

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

  const handleCreateList = async () => {
    if (newList.title.trim()) {
      try {
        await createList(newList);
        setNewList({ title: '', description: '', color: 'bg-blue-500' });
        setShowCreateForm(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleUpdateList = async (id: string, updates: any) => {
    try {
      await updateList(id, updates);
      setEditingList(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteList = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this list? All tasks in this list will also be deleted.')) {
      try {
        await deleteList(id);
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
          <h1 className="text-2xl font-bold text-gray-900">Lists</h1>
          <p className="text-gray-600">Organize your tasks into manageable lists</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create List</span>
        </button>
      </div>

      {/* Create List Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New List</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">List Title</label>
              <input
                type="text"
                value={newList.title}
                onChange={(e) => setNewList({ ...newList, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter list title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter list description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewList({ ...newList, color })}
                    className={`w-8 h-8 rounded-full ${color} ${
                      newList.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => {
          const progress = getProgressPercentage(list.completedCount, list.taskCount);
          return (
            <div key={list.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${list.color}`}></div>
                    <h3 className="text-lg font-semibold text-gray-900">{list.title}</h3>
                  </div>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {list.description && (
                  <p className="text-gray-600 text-sm mb-4">{list.description}</p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${list.color}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{list.completedCount} of {list.taskCount} completed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {list.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Personal</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingList(list.id)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteList(list.id)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Lists;