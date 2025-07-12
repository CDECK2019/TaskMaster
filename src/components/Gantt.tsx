import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useWorkstreams } from '../hooks/useWorkstreams';
import { useTasks } from '../hooks/useTasks';
import { useIconTheme } from '../contexts/IconThemeContext';
import { formatDate, getPriorityColor } from '../utils/data';

interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  workstreamId: string;
  workstreamTitle: string;
  columnTitle: string;
  completed: boolean;
}

type ViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year';

const Gantt: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { workstreams, loading: workstreamsLoading } = useWorkstreams();
  const { tasks } = useTasks();
  const { icons } = useIconTheme();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [manualViewMode, setManualViewMode] = useState<ViewMode | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectWorkstreams = workstreams.filter(w => w.projectId === selectedProjectId);

  // Convert workstream tasks to Gantt format
  const ganttTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    
    const tasks: GanttTask[] = [];
    
    projectWorkstreams.forEach(workstream => {
      workstream.columns.forEach(column => {
        column.tasks.forEach(task => {
          if (!task.dueDate && !showCompleted) return;
          if (!showCompleted && task.completed) return;
          
          // Calculate start and end dates
          const dueDate = task.dueDate ? new Date(task.dueDate) : new Date();
          const startDate = new Date(dueDate);
          startDate.setDate(dueDate.getDate() - 7); // Assume 7 days duration if no start date
          
          // Calculate progress based on column position
          let progress = 0;
          const columnIndex = workstream.columns.findIndex(c => c.id === column.id);
          const totalColumns = workstream.columns.length;
          if (task.completed) {
            progress = 100;
          } else if (totalColumns > 0) {
            progress = Math.round((columnIndex / (totalColumns - 1)) * 80); // Max 80% if not completed
          }
          
          tasks.push({
            id: task.id,
            title: task.title,
            startDate,
            endDate: dueDate,
            progress,
            priority: task.priority,
            workstreamId: workstream.id,
            workstreamTitle: workstream.title,
            columnTitle: column.title,
            completed: task.completed
          });
        });
      });
    });
    
    return tasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [selectedProjectId, projectWorkstreams, showCompleted]);

  // Calculate optimal view mode based on date range
  const optimalViewMode = useMemo((): ViewMode => {
    if (ganttTasks.length === 0) return 'month';
    
    const dates = ganttTasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) return 'day';
    if (daysDiff <= 30) return 'week';
    if (daysDiff <= 120) return 'month';
    if (daysDiff <= 365) return 'quarter';
    return 'year';
  }, [ganttTasks]);

  const viewMode = manualViewMode || optimalViewMode;

  // Generate timeline dates based on view mode and data range
  const timelineDates = useMemo(() => {
    const dates = [];
    let start = new Date(currentDate);
    let daysToShow = 30;
    let increment = 1; // days
    
    // If we have tasks, center the view around the task date range
    if (ganttTasks.length > 0) {
      const taskDates = ganttTasks.flatMap(task => [task.startDate, task.endDate]);
      const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));
      
      // Add some padding around the task dates
      const padding = Math.max(7, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * 0.1);
      start = new Date(minDate);
      start.setDate(start.getDate() - padding);
      
      const totalRange = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + (padding * 2);
      
      switch (viewMode) {
        case 'day':
          daysToShow = Math.min(14, Math.max(7, totalRange));
          increment = 1;
          break;
        case 'week':
          daysToShow = Math.min(84, Math.max(14, totalRange)); // 2-12 weeks
          increment = 1;
          start.setDate(start.getDate() - start.getDay()); // Start from Sunday
          break;
        case 'month':
          daysToShow = Math.min(180, Math.max(30, totalRange)); // 1-6 months
          increment = 1;
          start.setDate(1); // Start from first day of month
          break;
        case 'quarter':
          daysToShow = Math.min(365, Math.max(90, totalRange)); // 3-12 months
          increment = 7; // Show weeks
          start.setDate(start.getDate() - start.getDay()); // Start from Sunday
          break;
        case 'year':
          daysToShow = Math.min(730, Math.max(365, totalRange)); // 1-2 years
          increment = 30; // Show months
          start.setDate(1); // Start from first day of month
          break;
      }
    } else {
      // Default behavior when no tasks
      switch (viewMode) {
        case 'day':
          daysToShow = 7;
          increment = 1;
          break;
        case 'week':
          daysToShow = 28;
          increment = 1;
          start.setDate(start.getDate() - start.getDay());
          break;
        case 'month':
          daysToShow = 30;
          increment = 1;
          start.setDate(1);
          break;
        case 'quarter':
          daysToShow = 90;
          increment = 7;
          start.setDate(start.getDate() - start.getDay());
          break;
        case 'year':
          daysToShow = 365;
          increment = 30;
          start.setDate(1);
          break;
      }
    }
    
    for (let i = 0; i < daysToShow; i += increment) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, [currentDate, viewMode, ganttTasks]);

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getTaskPosition = (task: GanttTask) => {
    const startDate = timelineDates[0];
    const endDate = timelineDates[timelineDates.length - 1];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate position and width as percentages
    const taskStart = Math.max(task.startDate.getTime(), startDate.getTime());
    const taskEnd = Math.min(task.endDate.getTime(), endDate.getTime());
    
    if (taskEnd < startDate.getTime() || taskStart > endDate.getTime()) {
      return null; // Task is outside visible range
    }
    
    const daysDiff = (date1: Date, date2: Date) => 
      Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    
    const startOffset = daysDiff(new Date(taskStart), startDate);
    const duration = daysDiff(new Date(taskEnd), new Date(taskStart)) + 1;
    
    const left = (startOffset / totalDays) * 100;
    const width = Math.max(2, (duration / totalDays) * 100); // Minimum 2% width for visibility
    
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - Math.max(0, left), width)}%` };
  };

  const formatTimelineHeader = () => {
    const taskCount = ganttTasks.length;
    const dateRange = taskCount > 0 ? (() => {
      const dates = ganttTasks.flatMap(task => [task.startDate, task.endDate]);
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysDiff} days`;
    })() : '';

    const modeText = manualViewMode ? `${viewMode} view` : `${viewMode} view (auto)`;
    
    switch (viewMode) {
      case 'day':
        const start = timelineDates[0];
        const end = timelineDates[timelineDates.length - 1];
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${modeText}`;
      case 'week':
        return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • ${modeText}`;
      case 'month':
        return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • ${modeText}`;
      case 'quarter':
        const quarterStart = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3 + 2, 1);
        return `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()} (${quarterStart.toLocaleDateString('en-US', { month: 'short' })} - ${quarterEnd.toLocaleDateString('en-US', { month: 'short' })}) • ${modeText}`;
      case 'year':
        return `${currentDate.getFullYear()} • ${modeText}`;
      default:
        return modeText;
    }
  };

  // Generate timeline header dates for display
  const timelineHeaderDates = useMemo(() => {
    // Create a clean monthly calendar header
    const months = [];
    const startDate = timelineDates[0];
    const endDate = timelineDates[timelineDates.length - 1];
    
    if (!startDate || !endDate) return [];
    
    // Get all unique months in the date range with proper boundaries
    const currentDate = new Date(startDate);
    currentDate.setDate(1); // Start from first day of month
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      // Calculate the position and width of this month in the timeline
      const totalDuration = endDate.getTime() - startDate.getTime();
      
      // Calculate visible portion of this month
      const visibleStart = Math.max(monthStart.getTime(), startDate.getTime());
      const visibleEnd = Math.min(monthEnd.getTime(), endDate.getTime());
      
      if (visibleEnd > visibleStart) {
        const leftPercent = ((visibleStart - startDate.getTime()) / totalDuration) * 100;
        const widthPercent = ((visibleEnd - visibleStart) / totalDuration) * 100;
      
        months.push({
          label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          year: monthStart.getFullYear(),
          date: monthStart,
          leftPercent: Math.max(0, leftPercent),
          widthPercent: Math.min(100 - Math.max(0, leftPercent), widthPercent)
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  }, [timelineDates, viewMode]);

  // Get today's position for the indicator line
  const getTodayPosition = () => {
    const today = new Date();
    const startDate = timelineDates[0];
    const endDate = timelineDates[timelineDates.length - 1];
    
    if (today < startDate || today > endDate) return null;
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (daysDiff / totalDays) * 100;
  };

  const todayPosition = getTodayPosition();

  const viewModeOptions: ViewMode[] = ['day', 'week', 'month', 'quarter', 'year'];

  if (projectsLoading || workstreamsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gantt Chart</h1>
          <p className="text-gray-600 dark:text-gray-300">Visual timeline of project workstreams and tasks</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {viewModeOptions.map((mode) => (
              <button
                key={mode}
                onClick={() => setManualViewMode(mode === optimalViewMode ? null : mode)}
                className={`px-3 py-1 rounded-md text-sm capitalize ${
                  viewMode === mode 
                    ? manualViewMode === mode
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={mode === optimalViewMode ? 'Optimal view (auto-selected)' : ''}
              >
                {mode}
                {mode === optimalViewMode && !manualViewMode && (
                  <span className="ml-1 text-xs">★</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <icons.close className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <icons.calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white min-w-[300px] text-center text-sm">
                {formatTimelineHeader()}
              </span>
            </div>
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <icons.close className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-adjustment info */}
      {!manualViewMode && ganttTasks.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <icons.close className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Smart Timeline View</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                The timeline automatically adjusted to <strong>{viewMode} view</strong> based on your task date range. 
                You can manually select a different view using the buttons above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Project Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Project</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Show completed tasks</span>
            </label>
            {manualViewMode && (
              <button
                onClick={() => setManualViewMode(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Reset to auto view
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedProjectId === project.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <icons.layers className="w-4 h-4" />
                  <span>{project.workstreamCount} workstreams</span>
                </div>
                <div className="flex items-center space-x-1">
                  <icons.workstreams className="w-4 h-4" />
                  <span>{project.taskCount || 0} tasks</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Chart */}
      {selectedProject ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${selectedProject.color}`}></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProject.title}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({ganttTasks.length} tasks in timeline)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <icons.filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Timeline view</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {ganttTasks.length === 0 ? (
              <div className="text-center py-12">
                <icons.clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks in timeline</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {showCompleted 
                    ? 'This project has no tasks with due dates yet.'
                    : 'No incomplete tasks with due dates found. Try enabling "Show completed tasks".'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline Header with Dates */}
                <div className="relative">
                  <div className="flex border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="w-80 flex-shrink-0">
                      <h4 className="font-medium text-gray-900 dark:text-white">Task</h4>
                    </div>
                    <div className="flex-1 relative">
                      {/* Clean Monthly Calendar Header */}
                      <div className="relative h-12 mb-2 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        {timelineHeaderDates.map((monthInfo, index) => (
                          <div 
                            key={index} 
                            className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-600 last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            style={{
                              left: `${monthInfo.leftPercent}%`,
                              width: `${monthInfo.widthPercent}%`
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center px-2">
                              <div className="text-center min-w-0 flex-1">
                                <div className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                                {monthInfo.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                {monthInfo.year}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Subtle Month Grid Lines */}
                      <div className="absolute top-12 bottom-0">
                        {timelineHeaderDates.map((monthInfo, index) => (
                          <div 
                            key={index} 
                            className="absolute top-0 bottom-0 border-r border-gray-100 dark:border-gray-700/50 last:border-r-0"
                            style={{
                              left: `${monthInfo.leftPercent}%`,
                              width: `${monthInfo.widthPercent}%`
                            }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* Today Indicator */}
                      {todayPosition !== null && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 dark:bg-red-400 z-10"
                          style={{ left: `${todayPosition}%` }}
                        >
                          <div className="absolute -top-2 -left-6 bg-red-500 dark:bg-red-400 text-white text-xs px-2 py-1 rounded shadow-sm">
                            Today
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks by Workstream */}
                {projectWorkstreams.map((workstream) => {
                  const workstreamTasks = ganttTasks.filter(task => task.workstreamId === workstream.id);
                  
                  if (workstreamTasks.length === 0) return null;
                  
                  return (
                    <div key={workstream.id} className="space-y-3">
                      <div className="flex items-center space-x-2 py-2 border-b border-gray-100 dark:border-gray-700">
                        <icons.layers className="w-5 h-5 text-gray-500" />
                        <h5 className="font-medium text-gray-900 dark:text-white">{workstream.title}</h5>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({workstreamTasks.length} tasks)</span>
                      </div>
                      
                      {workstreamTasks.map((task) => {
                        const position = getTaskPosition(task);
                        
                        return (
                          <div key={task.id} className="flex items-center group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2">
                            <div className="w-80 flex-shrink-0 pr-4">
                              <div className="flex items-center space-x-3">
                                {task.completed ? (
                                  <icons.completed className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h6 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                    {task.title}
                                  </h6>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{task.columnTitle}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 relative h-8">
                              {/* Month Grid Lines for this row */}
                              <div className="absolute inset-0">
                                {timelineHeaderDates.map((monthInfo, index) => (
                                  <div 
                                    key={index} 
                                    className="absolute top-0 bottom-0 border-r border-gray-100 dark:border-gray-700/30 last:border-r-0"
                                    style={{
                                      left: `${monthInfo.leftPercent}%`,
                                      width: `${monthInfo.widthPercent}%`
                                    }}
                                  ></div>
                                ))}
                              </div>
                              
                              {/* Task Bar */}
                              {position && (
                                <div
                                  className="absolute top-1 h-6 rounded-md flex items-center px-2 text-xs font-medium text-white shadow-sm z-20 cursor-pointer hover:shadow-md transition-shadow"
                                  style={{
                                    left: position.left,
                                    width: position.width,
                                    backgroundColor: task.completed ? '#10B981' : 
                                      task.priority === 'high' ? '#EF4444' :
                                      task.priority === 'medium' ? '#F59E0B' : '#6B7280'
                                  }}
                                  title={`${task.title} - Due: ${formatDate(task.endDate.toISOString().split('T')[0])}`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="truncate flex-1">{task.progress}%</span>
                                    <span className="text-xs opacity-75 ml-1">
                                      {task.endDate.toLocaleDateString('en-US', { 
                                        month: viewMode === 'year' ? 'short' : 'numeric',
                                        day: viewMode === 'year' ? undefined : 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Task not in visible range indicator */}
                              {!position && (
                                <div className="absolute top-1 left-0 h-6 px-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs flex items-center">
                                  Outside range
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <icons.folder className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Project</h3>
          <p className="text-gray-600 dark:text-gray-300">Choose a project above to view its Gantt chart timeline</p>
        </div>
      )}
    </div>
  );
};

export default Gantt;