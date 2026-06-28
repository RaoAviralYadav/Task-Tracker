import { useState } from 'react';
import { Pencil, Trash2, Calendar, Tag, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task, Status } from '@/types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}

const priorityConfig = {
  low: {
    border: '#10B981',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Low',
    dot: 'bg-emerald-500',
  },
  medium: {
    border: '#F59E0B',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Medium',
    dot: 'bg-amber-500',
  },
  high: {
    border: '#EF4444',
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'High',
    dot: 'bg-red-500',
  },
};

const statusConfig = {
  todo: { icon: Circle, label: 'To Do', color: 'text-stone-500', next: 'in-progress' as Status },
  'in-progress': { icon: Clock, label: 'In Progress', color: 'text-blue-600', next: 'completed' as Status },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-emerald-600', next: 'todo' as Status },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string): boolean {
  const d = new Date(dateStr + 'T23:59:59');
  return d < new Date();
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toggling, setToggling] = useState(false);
  const p = priorityConfig[task.priority];
  const s = statusConfig[task.status];
  const StatusIcon = s.icon;
  const overdue = task.dueDate && task.status !== 'completed' && isOverdue(task.dueDate);

  async function handleStatusToggle() {
    if (toggling) return;
    setToggling(true);
    await onStatusChange(task._id, s.next);
    setToggling(false);
  }

  return (
    <div
      className={`group relative bg-white rounded-xl border border-stone-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        task.status === 'completed' ? 'opacity-75' : ''
      }`}
      style={{ borderLeft: `4px solid ${p.border}` }}
    >
      {/* Header row */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Status toggle */}
          <button
            onClick={handleStatusToggle}
            title={`Mark as ${statusConfig[s.next].label}`}
            className={`mt-0.5 flex-shrink-0 transition-transform ${toggling ? 'opacity-50' : 'hover:scale-110'} ${s.color}`}
          >
            <StatusIcon size={18} strokeWidth={2} />
          </button>

          {/* Title + tags */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold text-stone-900 leading-snug mb-1 ${
                task.status === 'completed' ? 'line-through text-stone-500' : ''
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {task.title}
            </h3>

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-stone-500 bg-stone-100 rounded-full border border-stone-200"
                  >
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit task"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="mt-2 text-xs text-stone-500 leading-relaxed line-clamp-2 pl-6">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 pl-10 flex items-center justify-between gap-2">
        {/* Priority badge */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.bg} ${p.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              overdue ? 'text-red-600 font-medium' : 'text-stone-400'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Calendar size={11} />
            {overdue ? 'Overdue · ' : ''}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200">
          <p className="text-sm font-medium text-stone-800">Delete this task?</p>
          <p className="text-xs text-stone-500 text-center px-6">
            "{task.title}" will be permanently removed.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Keep it
            </button>
            <button
              onClick={() => {
                setConfirmDelete(false);
                onDelete(task._id);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
