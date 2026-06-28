import { Search, SortAsc, SortDesc, X } from 'lucide-react';
import { FilterState, SortField, SortOrder, Status, Priority } from '@/types';

interface Props {
  filters: FilterState;
  sortField: SortField;
  sortOrder: SortOrder;
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  totalCount: number;
  filteredCount: number;
}

const STATUS_OPTIONS: { value: FilterState['status']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: FilterState['priority']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

export function FilterBar({
  filters,
  sortField,
  sortOrder,
  onFilterChange,
  onSortChange,
  totalCount,
  filteredCount,
}: Props) {
  const hasActiveFilters =
    filters.status !== 'all' || filters.priority !== 'all' || filters.search !== '';

  function clearAll() {
    onFilterChange({ status: 'all', priority: 'all', search: '' });
  }

  return (
    <div
      className="space-y-3"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks…"
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-stone-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter pills row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <div className="flex items-center gap-0 border border-stone-200 rounded-lg overflow-hidden bg-white">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ ...filters, status: opt.value })}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-stone-200 last:border-r-0
                ${filters.status === opt.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-50'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-0 border border-stone-200 rounded-lg overflow-hidden bg-white">
          {PRIORITY_OPTIONS.map((opt) => {
            const colors: Record<string, string> = {
              all: 'bg-stone-900 text-white',
              high: 'bg-red-600 text-white',
              medium: 'bg-amber-500 text-white',
              low: 'bg-emerald-600 text-white',
            };
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ ...filters, priority: opt.value })}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-stone-200 last:border-r-0
                  ${filters.priority === opt.value
                    ? colors[opt.value]
                    : 'text-stone-600 hover:bg-stone-50'
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 ml-auto">
          <select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField, sortOrder)}
            className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-stone-600 outline-none focus:border-blue-400 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 border border-stone-200 rounded-lg bg-white text-stone-600 hover:bg-stone-50 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
          </button>
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          {filteredCount === totalCount
            ? `${totalCount} task${totalCount !== 1 ? 's' : ''}`
            : `${filteredCount} of ${totalCount} tasks`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
          >
            <X size={11} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
