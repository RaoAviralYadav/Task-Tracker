import { useState, useEffect } from 'react';
import { X, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Task, CreateTaskDto, Priority, Status } from '@/types';

interface Props {
  initial?: Task | null;
  onSubmit: (dto: CreateTaskDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function TaskForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setStatus(initial.status);
      setPriority(initial.priority);
      setDueDate(initial.dueDate || '');
      setTags(initial.tags || []);
    }
  }, [initial]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = 'Title is required.';
    else if (title.trim().length < 3) e.title = 'Title must be at least 3 characters.';
    else if (title.trim().length > 100) e.title = 'Title must be 100 characters or fewer.';

    if (description.length > 500) e.description = 'Description must be 500 characters or fewer.';

    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) e.dueDate = 'Enter a valid date.';
    }
    return e;
  }

  function touch(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate();
    setErrors(errs);
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (t && !tags.includes(t) && tags.length < 5) {
        setTags([...tags, t]);
      }
      setTagInput('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ title: true, description: true, dueDate: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      tags,
    });
  }

  const errs = touched.title || touched.description ? validate() : errors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-stone-200"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <h2
            className="text-lg font-semibold text-stone-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {initial ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => touch('title')}
              placeholder="What needs to be done?"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-all
                ${errs.title && touched.title
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-stone-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
            />
            {errs.title && touched.title && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errs.title}
              </p>
            )}
            <p className="mt-1 text-xs text-stone-400 text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => touch('description')}
              placeholder="Add more detail (optional)"
              rows={3}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-all resize-none
                ${errs.description && touched.description
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-stone-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
            />
            {errs.description && touched.description && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errs.description}
              </p>
            )}
            <p className="mt-1 text-xs text-stone-400 text-right">{description.length}/500</p>
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status</label>
              <div className="flex flex-col gap-1.5">
                {STATUSES.map((s) => (
                  <label key={s.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => setStatus(s.value)}
                      className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer
                        ${status === s.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-stone-300 group-hover:border-blue-400'
                        }`}
                    >
                      {status === s.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm text-stone-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Priority</label>
              <div className="flex flex-col gap-1.5">
                {PRIORITIES.map((p) => {
                  const colors = {
                    low: 'border-emerald-500 bg-emerald-500',
                    medium: 'border-amber-500 bg-amber-500',
                    high: 'border-red-500 bg-red-500',
                  };
                  const ringColors = {
                    low: 'group-hover:border-emerald-400',
                    medium: 'group-hover:border-amber-400',
                    high: 'group-hover:border-red-400',
                  };
                  return (
                    <label key={p.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => setPriority(p.value)}
                        className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer
                          ${priority === p.value
                            ? colors[p.value]
                            : `border-stone-300 ${ringColors[p.value]}`
                          }`}
                      >
                        {priority === p.value && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm text-stone-700">{p.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Due Date
              </span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() => touch('dueDate')}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-all
                ${errs.dueDate && touched.dueDate
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-stone-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
            />
            {errs.dueDate && touched.dueDate && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errs.dueDate}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag size={14} /> Tags
                <span className="text-stone-400 font-normal">(press Enter to add, max 5)</span>
              </span>
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-blue-900 ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              disabled={tags.length >= 5}
              placeholder={tags.length >= 5 ? 'Max 5 tags reached' : 'e.g. backend, urgent...'}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-40 disabled:bg-stone-50"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
            >
              {loading ? 'Saving…' : initial ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
