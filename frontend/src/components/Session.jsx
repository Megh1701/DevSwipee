import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Sun, Moon, Plus, Calendar, Users, Play, X, ChevronLeft, ChevronRight, User, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { fa } from 'zod/v4/locales';
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

  console.log(sessionId);

  const currentUser = localStorage.getItem("userId");


  const isOwnercheck = sessionInfo?.members?.some(
    (m) =>
      m.role === "OWNER" &&
      m.userId?._id?.toString() === currentUser?.toString()
  );

  const isOwnerOnlyMode = sessionInfo?.assignmentMode === "OWNER_ONLY";


  console.log("isownerMode->",isOwnerOnlyMode)
  console.log("isowner->",isOwnercheck)

  const canAssign = isOwnerOnlyMode && isOwnercheck;


  console.log("canAssign->",canAssign)
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
      console.log("connected:", socket.id);
      socket.emit("join-session", sessionId);
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [sessionId]);

  useEffect(() => {
    const getSessionInfo = async () => {
      const res = await api.get(`/api/session/${sessionId}`);
      console.log(res.data)
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
        console.log("DATA:", res.data);
        setTasks(res.data.tasks)
        setSessionData(res.data || null);

      } catch (err) {
        console.log(err.response?.data);
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
      console.log(err);
    }
  };

  useEffect(() => {
    console.log(socket.connected);
    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task deleted");
    });

    return () => {
      socket.off("taskDeleted");
    };
  }, []);

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
      console.log(err.response?.data);
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
    console.log(err.response?.data);
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
          onClick={() => deleteTask(task._id)}
          className="absolute cursor-pointer top-2 right-2 opacity-0 group-hover:opacity-100 transition-all
    p-1.5 rounded-md hover:bg-red-500/10 text-red-500"
        >
          <Trash2 size={14} />
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
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
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
        <div className="flex items-center gap-2 flex-shrink-0">
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{sessionInfo?.projectName || 'DevSwipe'}</h1>
              {sessionInfo?.description && (
                <p className="text-sm text-muted-foreground mt-1">{sessionInfo.description}</p>
              )}
              <div className='gap-1'>
                <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                  {sessionInfo?.assignmentMode === "ANYONE" && "Anyone can assign tasks"}
                  {sessionInfo?.assignmentMode === "OWNER_ONLY" && "Only owner assigns"}
                  {sessionInfo?.assignmentMode === "SELF_ONLY" && "Self assign only"}
                </span>

                <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">
                  Live Collaboration
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
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
        <div className="flex items-center gap-4  absolute right-10 top-20">
          <div className="text-sm">
            <span className="font-semibold">{completedCount}/{totalCount}</span>
            <span className="text-muted-foreground"> tasks completed</span>
          </div>

          <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-sm font-semibold text-blue-500 w-12">
            {progressPercent}%
          </span>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do */}
            <Droppable droppableId="todo">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-card border border-border rounded-xl p-5 min-h-96 transition-all ${snapshot.isDraggingOver ? 'bg-secondary/50 border-accent/50' : ''
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    />

                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Task description..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none h-20"
                    />

                    <div className="relative" ref={datePickerRef}>
                      <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-full text-left px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground hover:border-accent hover:text-foreground transition-all flex items-center gap-2 group"
                      >
                        <Calendar size={16} className="group-hover:text-accent transition-colors" />
                        {newTaskDueDate
                          ? newTaskDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'Add Due Date'
                        }
                      </button>


                      <div className="flex gap-2 m-4">
                        <span>Priority:</span>
                        {['low', 'medium', 'high'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewTaskPriority(p)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${newTaskPriority === p
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-background border-border hover:border-blue-400'
                              }`}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {showDatePicker && (
                        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 z-50 w-72">
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
                              className="flex-1 px-3 py-2 bg-blue-500 text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >add task
                            </button>
                            <button
                              onClick={resetTaskForm}
                              className="px-3 py-2 bg-secondary hover:bg-border rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
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
                      <div className="flex gap-2">
                        <button
                          onClick={addTask}
                          disabled={!newTaskTitle.trim() || (!canAssign)}
 className="flex-1 px-3 py-2 bg-blue-500 text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      
                        >{canAssign ? "add Task" : "Only owner can assign tasks"}</button>
                        <button
                          onClick={resetTaskForm}
                          className="px-3 py-2 bg-secondary hover:bg-border rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
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
                  className={`bg-card border border-border rounded-xl p-5 min-h-96 transition-all ${snapshot.isDraggingOver ? 'bg-secondary/50 border-accent/50' : ''
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
                  className={`bg-card border border-border rounded-xl p-5 min-h-96 transition-all ${snapshot.isDraggingOver ? 'bg-secondary/50 border-accent/50' : ''
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