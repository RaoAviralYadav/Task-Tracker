import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { Task, CreateTaskDto, FilterState, SortField, SortOrder, Toast, Status } from '@/types';
import { api } from '@/services/api';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { FilterBar } from '@/components/FilterBar';
import { StatsSidebar } from '@/components/StatsSidebar';
import { ToastContainer } from '@/components/ToastContainer';

const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

function genToastId() {
  return Math.random().toString(36).slice(2);
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filters, setFilters] = useState<FilterState>({ status: 'all', priority: 'all', search: '' });
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  function toast(message: string, type: Toast['type'] = 'success') {
    const id = genToastId();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      setError('Failed to load tasks. Please try again.');
      toast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(dto: CreateTaskDto) {
    try {
      setSubmitting(true);
      const created = await api.createTask(dto);
      setTasks((prev) => [created, ...prev]);
      setShowForm(false);
      toast('Task created!', 'success');
    } catch {
      toast('Failed to create task.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(dto: CreateTaskDto) {
    if (!editTask) return;
    try {
      setSubmitting(true);
      const updated = await api.updateTask(editTask._id, dto);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setEditTask(null);
      setShowForm(false);
      toast('Task updated!', 'success');
    } catch {
      toast('Failed to update task.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast('Task deleted.', 'info');
    } catch {
      toast('Failed to delete task.', 'error');
    }
  }

  async function handleStatusChange(id: string, status: Status) {
    try {
      const updated = await api.updateTask(id, { status });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      const label: Record<string, string> = { todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };
      toast(`Moved to ${label[status]}`, 'success');
    } catch {
      toast('Failed to update status.', 'error');
    }
  }

  function openEdit(task: Task) {
    setEditTask(task);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTask(null);
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...tasks];

    if (filters.status !== 'all') result = result.filter((t) => t.status === filters.status);
    if (filters.priority !== 'all') result = result.filter((t) => t.priority === filters.priority);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'dueDate') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = da - db;
      } else if (sortField === 'priority') {
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [tasks, filters, sortField, sortOrder]);

  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = { todo: [], 'in-progress': [], completed: [] };
    filteredAndSorted.forEach((t) => { groups[t.status]?.push(t); });
    return groups;
  }, [filteredAndSorted]);

  const GROUPS = [
    { key: 'todo', label: 'To Do', dot: 'bg-stone-400' },
    { key: 'in-progress', label: 'In Progress', dot: 'bg-blue-500' },
    { key: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
  ];

  const showGrouped = filters.status === 'all' && filters.search === '' && filters.priority === 'all';

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F3', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {showForm && (
        <TaskForm
          initial={editTask}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onCancel={closeForm}
          loading={submitting}
        />
      )}

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
              <ClipboardList size={15} className="text-white" />
            </div>
            <h1 className="text-base font-bold text-stone-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              TaskTracker
            </h1>
            <span className="hidden sm:inline text-xs text-stone-400 border border-stone-200 rounded-full px-2 py-0.5">
              MERN Stack
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTasks} disabled={loading} className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" title="Refresh">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => { setEditTask(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <StatsSidebar tasks={tasks} />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <FilterBar
              filters={filters}
              sortField={sortField}
              sortOrder={sortOrder}
              onFilterChange={setFilters}
              onSortChange={(f, o) => { setSortField(f); setSortOrder(o); }}
              totalCount={tasks.length}
              filteredCount={filteredAndSorted.length}
            />

            {loading && (
              <div className="mt-16 flex flex-col items-center gap-3 text-stone-400">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm">Loading tasks…</p>
              </div>
            )}

            {error && !loading && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={fetchTasks} className="mt-2 text-xs text-red-700 underline hover:no-underline">Retry</button>
              </div>
            )}

            {!loading && !error && tasks.length === 0 && (
              <div className="mt-16 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center">
                  <ClipboardList size={28} className="text-stone-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-stone-700" style={{ fontFamily: "'Syne', sans-serif" }}>No tasks yet</p>
                  <p className="text-sm text-stone-400 mt-1">Create your first task to get started.</p>
                </div>
                <button
                  onClick={() => { setEditTask(null); setShowForm(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <Plus size={14} /> New Task
                </button>
              </div>
            )}

            {!loading && !error && tasks.length > 0 && filteredAndSorted.length === 0 && (
              <div className="mt-16 text-center">
                <p className="text-sm text-stone-500">No tasks match your filters.</p>
                <button onClick={() => setFilters({ status: 'all', priority: 'all', search: '' })} className="mt-2 text-xs text-blue-600 hover:underline">
                  Clear filters
                </button>
              </div>
            )}

            {!loading && !error && filteredAndSorted.length > 0 && showGrouped && (
              <div className="mt-6 space-y-6">
                {GROUPS.map(({ key, label, dot }) => {
                  const items = grouped[key];
                  if (items.length === 0) return null;
                  return (
                    <section key={key}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</h2>
                        <span className="text-xs text-stone-400 ml-1">{items.length}</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((task) => (
                          <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {!loading && !error && filteredAndSorted.length > 0 && !showGrouped && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAndSorted.map((task) => (
                  <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
