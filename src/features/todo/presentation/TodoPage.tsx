import { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiClipboard,
  FiSquare,
  FiCheckSquare,
  FiFolder
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import {
  fetchProjects,
  createProject,
  deleteProject,
  addTask,
  toggleTask,
  deleteTask,
} from '../redux/todoSlice';
import ConfirmModal from '../../../general/components/ConfirmModal';

function TodoPage() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();

  // Selectors
  const { user } = useSelector((state: RootState) => state.user);
  const { projects, loadingProjects } = useSelector(
    (state: RootState) => state.todo
  );

  // Local State
  const [newProjectName, setNewProjectName] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  // References
  const todoInputRef = useRef<HTMLInputElement>(null);

  // Load projects once on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProjects({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  // Tasks are fetched inline inside project documents; no separate fetch needed.

  const activeProject = projects.find((p) => p.id === projectId);
  const tasks = activeProject ? activeProject.tasks : [];

  const filteredTasks = useMemo(() => {
    if (activeTab === 'completed') {
      return tasks.filter((t) => t.completed);
    }
    return tasks.filter((t) => !t.completed);
  }, [tasks, activeTab]);

  // Handle Project Creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    if (!user?.id) return;

    try {
      const resultAction = await dispatch(
        createProject({ name: newProjectName.trim(), userId: user.id })
      );
      if (createProject.fulfilled.match(resultAction)) {
        toast.success('Project created successfully');
        setNewProjectName('');
        setIsCreatingProject(false);
        // Automatically select the newly created project
        navigate(`/todo/${resultAction.payload.id}`);
      }
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  // Handle Project Deletion
  const handleDeleteProjectConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const resultAction = await dispatch(deleteProject({ projectId: projectToDelete }));
      if (deleteProject.fulfilled.match(resultAction)) {
        toast.success('Project deleted successfully');
        // If the deleted project was the active one, navigate to base todo URL
        if (projectId === projectToDelete) {
          navigate('/todo');
        }
      }
    } catch (err) {
      toast.error('Failed to delete project');
    } finally {
      setProjectToDelete(null);
    }
  };

  // Handle Task Creation
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    if (!projectId || !user?.id) return;

    try {
      const resultAction = await dispatch(
        addTask({ projectId, title: newTodoTitle.trim() })
      );
      if (addTask.fulfilled.match(resultAction)) {
        toast.success('Task added');
        setNewTodoTitle('');
        // Focus the input back
        todoInputRef.current?.focus();
      }
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  // Handle Task Toggle
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!projectId) return;
    try {
      await dispatch(toggleTask({ projectId, taskId, completed: !currentCompleted }));
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    try {
      const resultAction = await dispatch(deleteTask({ projectId, taskId }));
      if (deleteTask.fulfilled.match(resultAction)) {
        toast.success('Task deleted');
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Count active/total tasks per project for badges
  // (We fetch projects at once, but we'd need their counts. To do this client-side or wait for queries.
  // Instead of querying counts for all, we can show a nice icon, or load counts in firestore later.
  // Let's keep it simple: project items list with delete buttons and nice icons).

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-40px)] overflow-hidden space-y-3 pb-4">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 px-1 pt-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900 md:text-xl">Todo Lists</h1>
          <p className="text-xs text-gray-500 md:text-sm">
            Create projects and keep track of your tasks
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        
        {/* PROJECTS PANE - Left side on desktop */}
        <div
          className={`
            w-full lg:w-80 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm
            ${projectId ? 'hidden lg:flex' : 'flex'}
          `}
        >
          {/* Projects Header & Create form */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <FiFolder className="text-primary" /> Projects
              </h2>
              {!isCreatingProject && (
                <button
                  onClick={() => setIsCreatingProject(true)}
                  className="p-1 rounded-lg hover:bg-gray-200 text-primary cursor-pointer transition-colors"
                  title="Create Project"
                >
                  <FiPlus size={18} />
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {isCreatingProject && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateProject}
                  className="space-y-2 overflow-hidden"
                >
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project Name..."
                    autoFocus
                    className="w-full text-xs rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingProject(false);
                        setNewProjectName('');
                      }}
                      className="px-2 py-1 text-[10px] font-semibold text-gray-500 rounded hover:bg-gray-150 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-primary rounded hover:bg-primary/90 cursor-pointer"
                    >
                      Create
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
            {loadingProjects ? (
              <div className="flex flex-col items-center justify-center py-8 text-xs text-gray-400 gap-2">
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 px-4">
                No projects created yet. Click the '+' button to create one!
              </div>
            ) : (
              projects.map((project) => {
                const isActive = project.id === projectId;
                return (
                  <div
                    key={project.id}
                    className={`
                      group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer
                      ${isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                    onClick={() => navigate(`/todo/${project.id}`)}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FiFolder className={isActive ? 'text-white' : 'text-primary'} />
                      <span className="text-sm font-medium truncate">{project.name}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project.id);
                      }}
                      className={`
                        p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer
                        ${isActive ? 'group-hover:opacity-100 text-white/70 hover:bg-primary-dark hover:text-white' : 'lg:opacity-0 group-hover:opacity-100'}
                      `}
                      title="Delete Project"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TASKS PANE - Right side on desktop */}
        <div
          className={`
            flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm
            ${!projectId ? 'hidden lg:flex' : 'flex'}
          `}
        >
          {activeProject ? (
            <>
              {/* Tasks Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/todo')}
                    className="p-1 rounded-lg hover:bg-gray-200 text-gray-600 lg:hidden cursor-pointer mr-1"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{activeProject.name}</h2>
                    <p className="text-[11px] text-gray-500">Todo List</p>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>

              {/* Add Task Input */}
              <form onSubmit={handleAddTask} className="p-4 border-b border-gray-100 shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={todoInputRef}
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 text-sm rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-primary focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/95 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                  >
                    <FiPlus size={16} /> Add
                  </button>
                </div>
              </form>

              {/* Tabs Switcher */}
              <div className="px-4 pt-3 pb-1 shrink-0 flex border-b border-gray-100 bg-gray-50/20">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-[280px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                      activeTab === 'pending'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Pending ({tasks.filter(t => !t.completed).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                      activeTab === 'completed'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Completed ({tasks.filter(t => t.completed).length})
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none bg-[#FAFAFA]">
                {loadingProjects ? (
                  <div className="flex flex-col items-center justify-center py-20 text-xs text-gray-400 gap-2 bg-white rounded-xl border border-gray-150">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 bg-white rounded-xl border border-gray-100 p-6 shadow-2xs">
                    <FiClipboard size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">
                      {activeTab === 'pending' ? 'No pending tasks' : 'No completed tasks'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                      {activeTab === 'pending'
                        ? 'All caught up! Create a new task above to get started.'
                        : 'Tasks you complete will show up here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {filteredTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`
                            flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-xs transition-all duration-200 group
                            ${task.completed ? 'opacity-85 border-gray-150' : ''}
                          `}
                        >
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleToggleTask(task.id, task.completed)}
                          >
                            <button
                              type="button"
                              className={`
                                text-lg shrink-0 transition-colors
                                ${task.completed ? 'text-primary' : 'text-gray-400 hover:text-primary'}
                              `}
                            >
                              {task.completed ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
                            </button>
                            <span
                              className={`
                                text-sm text-gray-800 font-medium truncate select-none
                                ${task.completed ? 'line-through text-gray-400 font-normal' : ''}
                              `}
                            >
                              {task.title}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-650 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ml-2"
                            title="Delete Task"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Blank Slate - No project selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="max-w-md flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FiClipboard size={32} />
                </div>
                <h3 className="text-base font-bold text-gray-900">No Project Selected</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                  Select a project from the left panel to view and manage tasks, or create a new project to get started.
                </p>
                <button
                  onClick={() => setIsCreatingProject(true)}
                  className="mt-5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-xs hover:bg-primary/95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlus size={16} /> Create New Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Project Confirmation Modal */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProjectConfirm}
        message="Are you sure you want to delete this project? This will permanently delete all associated tasks."
      />
    </div>
  );
}

export default TodoPage;
