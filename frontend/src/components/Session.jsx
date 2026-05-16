import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Sun, Moon, Plus, Calendar, Users, Play, X, ChevronLeft, ChevronRight, User, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import socket from "../socket/socket.js";


const priorityConfig = {
  LOW: { label: 'LOW', color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400' },
  MEDIUM: { label: 'MEDIUM', color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-400' },
  HIGH: { label: 'HIGH', color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400' },
};

const getDateStatus = (date) => {
  if (!date) return { label: '', className: '' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' };
  if (diffDays === 0) return { label: 'Due today', className: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' };
  if (diffDays <= 3) return { label: `${diffDays}d left`, className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' };
  return { label: `${diffDays}d left`, className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
};



export default function DevSwipeKanban() {
  const [tasks, setTasks] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isOwner, setIsOwner] = useState(null)
  const [isMember, setIsMember] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null);
  const { sessionId } = useParams();

  const { userId: currentUser } = useAuth();


  const isOwnercheck = sessionInfo?.members?.some(
    (m) =>
      m.role === "OWNER" &&
      m.userId?._id?.toString() === currentUser?.toString()
  );

  const isOwnerOnlyMode = sessionInfo?.assignmentMode === "OWNER_ONLY";



  const canAssign =
    sessionInfo?.assignmentMode === "OWNER_ONLY"
      ? isOwnercheck
      : true;


  const isCurrentUserOwner = sessionInfo?.members?.some(
    (member) =>
      member.role === "OWNER" &&
      member.userId?._id?.toString() === currentUser?.toString()
  );

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      socket.emit("join-session", sessionId);
    };

    socket.on("connect", onConnect);

    // Listen for task creation events
    socket.on("taskCreated", (newTask) => {
      setTasks((prev) => [
        ...prev,
        {
          ...newTask,
          status: newTask.status || "TODO",
        },
      ]);
      toast.success("Task created by team member");
    });

    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task deleted by team member");
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("taskCreated");
      socket.off("taskDeleted");
      socket.off("taskUpdated");
    };
  }, [sessionId]);

  useEffect(() => {
    const getSessionInfo = async () => {
      const res = await api.get(`/api/session/${sessionId}`);
      setSessionInfo(res.data);



      const owner = res.data.members.find(
        (member) => member.role === "OWNER"
      );

      const otherMembers = res.data.members.filter(
        (member) => member.role !== "OWNER"
      );

      setIsOwner(owner)
      setIsMember(otherMembers[0])
    }
    getSessionInfo()
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return;

    const getSession = async () => {
      try {
        const res = await api.get(`api/tasks/${sessionId}`);
        setTasks(res.data.tasks)
        setSessionData(res.data || null);

      } catch (err) {
        toast.error("Failed to load tasks");
      }
    };

    getSession();
  }, [sessionId]);

  useEffect(() => {
    const savedDark = localStorage.getItem('devswipe-dark') === 'false';
    setIsDark(savedDark);
    applyTheme(savedDark);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  const applyTheme = (dark) => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('devswipe-dark', newDark.toString());
    applyTheme(newDark);
  };
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId.toUpperCase();


    setTasks((prev) =>
      prev.map((task) =>
        task._id === draggableId
          ? { ...task, status: newStatus }
          : task
      )
    );

    try {
      await api.patch(`/api/tasks/${draggableId}/move`, {
        status: newStatus,
      });
    } catch (err) {
      toast.error("Failed to move task");
    }
  };



  const deleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Delete this task?");
    if (!confirmDelete) return;
    try {
      const res = await api.delete(`/api/delete/${taskId}`);
      if (res.data?.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.success(res.data.message || "Task Deleted");
      } else {
        toast.error("Failed to delete task");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };
  const resetTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(null);
    setNewTaskPriority('medium');
    setShowDatePicker(false);
  };

  const addTask = async () => {
  if (!newTaskTitle.trim()) return;


  if (!newTaskDescription.trim()) {
    toast.error("Description is required");
    return;
  }

  if (!newTaskDueDate) {
    toast.error("Please select a due date");
    return;
  }

  if (!selectedAssignee) {
    toast.error("Please assign a task");
    return;
  }

  try {
    const payload = {
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority.toUpperCase(),
      assignedTo: selectedAssignee,
      dueDate: newTaskDueDate,
    };

    const res = await api.post(`/api/${sessionId}/create`, payload);

    setTasks((prev) => [
      ...prev,
      {
        ...res.data.task,
        status: res.data.task.status || "TODO",
      },
    ]);

    resetTaskForm();
    toast.success("Task created successfully");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to create task");
  }
};

  const handleSetToday = () => setNewTaskDueDate(new Date());

  const handleSetTomorrow = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setNewTaskDueDate(t);
  };

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderDatePicker = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const isDateSelected = (date) => {
    if (!newTaskDueDate) return false;
    return (
      date.getDate() === newTaskDueDate.getDate() &&
      date.getMonth() === newTaskDueDate.getMonth() &&
      date.getFullYear() === newTaskDueDate.getFullYear()
    );
  };

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'INPROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  const members = sessionInfo?.members || [];

  const TaskCard = ({ task, provided, snapshot }) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`group relative bg-background border border-border rounded-xl p-4 transition-all duration-200
       ${snapshot.isDragging
          ? 'shadow-xl scale-[1.02] rotate-1 border-blue-500/40'
          : 'shadow-sm hover:shadow-md hover:border-blue-400/30'
        }`}
    >
      {isCurrentUserOwner && (
        <button
          onClick={() => {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (confirmDelete) {
              deleteTask(task._id);
            }
          }}
          className="absolute cursor-pointer top-2 right-2 opacity-0 group-hover:opacity-100 transition-all
    p-1.5 rounded-md hover:bg-red-500/10 text-red-500"
        >
          Delete
        </button>
      )}

      {/* Top Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-5 truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">

        {/* Left Side - Assignee */}
        <div className="flex items-center gap-2 min-w-0">
          {task.assignedTo ? (
            <>
              {task.assignedTo?.avatar ? (
                <img
                  src={task.assignedTo.avatar}
                  alt={task.assignedTo.name}
                  className="w-8 h-8 rounded-full object-cover border bg-blue-200 border-background shadow-sm"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-background shadow-sm
      ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
                >
                  {task.assignedTo?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="text-xs text-muted-foreground truncate max-w-20">
                {task.assignedTo.name || task.assignedTo}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              Unassigned
            </span>
          )}
        </div>

        {/* Right Side - Priority + Due */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-md bg-secondary
            ${priorityConfig[task?.priority]?.textColor ?? 'text-gray-500'}`}
          >
            {priorityConfig[task?.priority]?.label ?? 'UNKNOWN'}
          </span>

          {task.dueDate && (
            <div
              className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-medium
              ${getDateStatus(task.dueDate).className}`}
            >
              <Calendar size={10} />
              {getDateStatus(task.dueDate).label}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold sm:text-3xl">{sessionInfo?.projectName || 'DevSwipe'}</h1>
              {sessionInfo?.description && (
                <p className="mt-1 text-sm text-muted-foreground wrap-break-word">{sessionInfo.description}</p>
              )}
              <div className='mt-2 flex flex-wrap gap-2'>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                  {sessionInfo?.assignmentMode === "ANYONE" && "Anyone can assign tasks"}
                  {sessionInfo?.assignmentMode === "OWNER_ONLY" && "Only owner assigns"}
                  {sessionInfo?.assignmentMode === "SELF_ONLY" && "Anyone can assign tasks"}
                </span>

                <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                  Live Collaboration
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-lg p-1 transition-colors hover:bg-secondary"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Stats Bar */}
          {/* Replace your current members section with this cleaner avatar stack */}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex -space-x-2">
              {members.length > 0 ? (
                members.map((member, idx) => {
                  const user = member?.userId;
                  const name = user?.name || "U";
                  const avatar = user?.avatar; // assumes backend sends avatar URL

                  return (
                    <div
                      key={member._id || idx}
                      className="relative group"
                      title={name}
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="w-8 h-8 bg-blue-200 rounded-full object-cover border border-background shadow-sm"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-background shadow-sm
      bg-black text-white `}
                        >
                          {name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded bg-black text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20">
                        {name}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User size={14} />
                </div>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              {members.length} collaborator{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="static mt-3 flex flex-col gap-2 pr-3 sm:absolute sm:right-10 sm:top-20 sm:mt-0 sm:pr-0">
          <div className="text-sm">
            <span className="font-semibold">{completedCount}/{totalCount}</span>
            <span className="text-muted-foreground"> tasks completed</span>
          </div>

          <div className="h-2 w-full max-w-56 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="w-12 text-sm font-semibold text-blue-500">
            {progressPercent}%
          </span>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {/* To Do */}
            <Droppable droppableId="todo">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-card border border-border rounded-xl p-4 sm:p-5 min-h-96 transition-all ${snapshot.isDraggingOver ? 'bg-secondary/50 border-accent/50' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">To Do</h2>
                    <span className="px-2.5 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">
                      {todoTasks.length}
                    </span>
                  </div>

                  <div className="mb-4 space-y-3">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      autoFocus
                      placeholder="Add new task..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                    />

                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Task description..."
                      className="h-20 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                    />

                    <div className="relative" ref={datePickerRef}>
                      <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="group flex min-h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm text-muted-foreground transition-all hover:border-accent hover:text-foreground"
                      >
                        <Calendar size={16} className="group-hover:text-accent transition-colors" />
                        {newTaskDueDate
                          ? newTaskDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'Add Due Date'
                        }
                      </button>


                      <div className="m-2 flex flex-wrap gap-2 sm:m-4">
                        <span>Priority:</span>
                        {['low', 'medium', 'high'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewTaskPriority(p)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${newTaskPriority === p
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-background border-border hover:border-blue-400'
                              }`}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {showDatePicker && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-3 shadow-lg sm:p-4">
                          {/* Quick Options */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                              onClick={handleSetToday}
                              className="px-3 py-2 bg-secondary hover:bg-blue-500 hover:text-accent-foreground rounded-lg text-sm font-medium transition-colors"
                            >
                              Today
                            </button>
                            <button
                              onClick={handleSetTomorrow}
                              className="px-3 py-2 bg-secondary hover:bg-blue-500 hover:text-accent-foreground rounded-lg text-sm font-medium transition-colors"
                            >
                              Tomorrow
                            </button>
                          </div>

                          {/* Calendar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-1 hover:bg-secondary rounded transition-colors"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <span className="text-sm font-semibold">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-1 hover:bg-secondary rounded transition-colors"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>

                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-xs font-semibold text-center text-muted-foreground">
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Days */}
                            <div className="grid grid-cols-7 gap-1">
                              {renderDatePicker().map((date, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (date) {
                                      setNewTaskDueDate(date);
                                      setShowDatePicker(false);
                                    }
                                  }}
                                  disabled={!date}
                                  className={`p-2 text-xs rounded transition-colors ${!date
                                    ? 'text-muted-foreground'
                                    : isDateSelected(date)
                                      ? 'bg-blue-500 text-accent-foreground font-semibold'
                                      : 'hover:bg-secondary'
                                    }`}
                                >
                                  {date?.getDate()}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={addTask}
                              disabled={!newTaskTitle.trim()}
                            className="flex-1 rounded-lg bg-blue-500 px-3 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >add task
                            </button>
                            <button
                              onClick={resetTaskForm}
                              className="flex min-h-10 items-center gap-1 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium transition-colors hover:bg-border"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="">Assign Task To</option>
                      {isOwner && (
                        <option value={isOwner.userId._id}>
                          {isOwner.userId.name}
                        </option>
                      )}
                      {isMember && (
                        <option value={isMember.userId._id}>
                          {isMember.userId.name}
                        </option>
                      )}

                    </select>
                    {!showDatePicker && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={addTask}
                          disabled={!newTaskTitle.trim() || (!canAssign)}
className="flex-1 rounded-lg bg-blue-500 px-3 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      
                        >{canAssign ? "add Task" : "Only owner can assign tasks"}</button>
                        <button
                          onClick={resetTaskForm}
                          className="flex min-h-10 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium transition-colors hover:bg-border"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {todoTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                    ) : (
                      todoTasks.map((task, index) => (

                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (

                            <TaskCard task={task} provided={provided} snapshot={snapshot} />
                          )}
                        </Draggable>

                      ))
                    )}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* In Progress */}
            <Droppable droppableId="inprogress">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-card border border-border rounded-xl p-4 sm:p-5 min-h-96 transition-all ${snapshot.isDraggingOver ? 'bg-secondary/50 border-accent/50' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">In Progress</h2>
                    <span className="px-2.5 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">
                      {inProgressTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {inProgressTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                    ) : (
                      inProgressTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <TaskCard task={task} provided={provided} snapshot={snapshot} />
                          )}
                        </Draggable>
                      ))
                    )}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Done */}
            <Droppable droppableId="done">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-card border border-border rounded-xl p-4 sm:p-5 min-h-96 transition-all ${snapshot.isDraggingOver ? 'bg-secondary/50 border-accent/50' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Done</h2>
                    <span className="px-2.5 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">
                      {doneTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {doneTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                    ) : (
                      doneTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <TaskCard task={task} provided={provided} snapshot={snapshot} />
                          )}
                        </Draggable>
                      ))
                    )}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}