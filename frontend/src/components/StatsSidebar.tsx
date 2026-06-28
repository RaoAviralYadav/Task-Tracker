// import { Task } from '@/types';
// import { LayoutGrid, CheckCircle2, Clock, Circle } from 'lucide-react';

// interface Props {
//   tasks: Task[];
// }

// export function StatsSidebar({ tasks }: Props) {
//   const total = tasks.length;
//   const completed = tasks.filter((t) => t.status === 'completed').length;
//   const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
//   const todo = tasks.filter((t) => t.status === 'todo').length;
//   const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
//   const overdue = tasks.filter((t) => {
//     if (!t.dueDate || t.status === 'completed') return false;
//     return new Date(t.dueDate + 'T23:59:59') < new Date();
//   }).length;

//   const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

//   return (
//     <div
//       className="space-y-4"
//       style={{ fontFamily: "'DM Sans', sans-serif" }}
//     >
//       {/* Progress */}
//       <div className="bg-white border border-stone-200 rounded-xl p-4">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
//             Overall Progress
//           </span>
//           <span
//             className="text-xl font-bold text-stone-900"
//             style={{ fontFamily: "'Syne', sans-serif" }}
//           >
//             {completionPct}%
//           </span>
//         </div>
//         <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
//             style={{ width: `${completionPct}%` }}
//           />
//         </div>
//         <p className="mt-2 text-xs text-stone-400">
//           {completed} of {total} tasks done
//         </p>
//       </div>

//       {/* Status breakdown */}
//       <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
//         <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">By Status</p>

//         <StatRow icon={<Circle size={14} className="text-stone-500" />} label="To Do" count={todo} total={total} color="bg-stone-400" />
//         <StatRow icon={<Clock size={14} className="text-blue-500" />} label="In Progress" count={inProgress} total={total} color="bg-blue-500" />
//         <StatRow icon={<CheckCircle2 size={14} className="text-emerald-500" />} label="Completed" count={completed} total={total} color="bg-emerald-500" />
//       </div>

//       {/* Alerts */}
//       {(high > 0 || overdue > 0) && (
//         <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
//           <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Attention</p>
//           {overdue > 0 && (
//             <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100">
//               <span className="text-xs text-red-700 font-medium">Overdue</span>
//               <span className="text-sm font-bold text-red-700">{overdue}</span>
//             </div>
//           )}
//           {high > 0 && (
//             <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-100">
//               <span className="text-xs text-amber-700 font-medium">High Priority</span>
//               <span className="text-sm font-bold text-amber-700">{high}</span>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Priority breakdown */}
//       <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
//         <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">By Priority</p>
//         {[
//           { label: 'High', color: 'bg-red-500', count: tasks.filter(t => t.priority === 'high').length },
//           { label: 'Medium', color: 'bg-amber-500', count: tasks.filter(t => t.priority === 'medium').length },
//           { label: 'Low', color: 'bg-emerald-500', count: tasks.filter(t => t.priority === 'low').length },
//         ].map(({ label, color, count }) => (
//           <div key={label} className="flex items-center gap-2">
//             <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
//             <span className="text-xs text-stone-600 flex-1">{label}</span>
//             <span
//               className="text-xs font-semibold text-stone-700"
//               style={{ fontFamily: "'JetBrains Mono', monospace" }}
//             >
//               {count}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function StatRow({
//   icon,
//   label,
//   count,
//   total,
//   color,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   count: number;
//   total: number;
//   color: string;
// }) {
//   const pct = total > 0 ? (count / total) * 100 : 0;
//   return (
//     <div className="space-y-1">
//       <div className="flex items-center justify-between">
//         <span className="flex items-center gap-1.5 text-xs text-stone-600">
//           {icon}
//           {label}
//         </span>
//         <span
//           className="text-xs font-semibold text-stone-700"
//           style={{ fontFamily: "'JetBrains Mono', monospace" }}
//         >
//           {count}
//         </span>
//       </div>
//       <div className="h-1 bg-stone-100 rounded-full">
//         <div
//           className={`h-full ${color} rounded-full transition-all duration-500`}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }


import { Task } from '@/types';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface Props {
  tasks: Task[];
}

export function StatsSidebar({ tasks }: Props) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    return new Date(t.dueDate + 'T23:59:59') < new Date();
  }).length;

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="space-y-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Progress */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            Overall Progress
          </span>
          <span
            className="text-xl font-bold text-stone-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {completionPct}%
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-stone-400">
          {completed} of {total} tasks done
        </p>
      </div>

      {/* Status breakdown */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">By Status</p>

        <StatRow icon={<Circle size={14} className="text-stone-500" />} label="To Do" count={todo} total={total} color="bg-stone-400" />
        <StatRow icon={<Clock size={14} className="text-blue-500" />} label="In Progress" count={inProgress} total={total} color="bg-blue-500" />
        <StatRow icon={<CheckCircle2 size={14} className="text-emerald-500" />} label="Completed" count={completed} total={total} color="bg-emerald-500" />
      </div>

      {/* Alerts */}
      {(high > 0 || overdue > 0) && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Attention</p>
          {overdue > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100">
              <span className="text-xs text-red-700 font-medium">Overdue</span>
              <span className="text-sm font-bold text-red-700">{overdue}</span>
            </div>
          )}
          {high > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-xs text-amber-700 font-medium">High Priority</span>
              <span className="text-sm font-bold text-amber-700">{high}</span>
            </div>
          )}
        </div>
      )}

      {/* Priority breakdown */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">By Priority</p>
        {[
          { label: 'High', color: 'bg-red-500', count: tasks.filter(t => t.priority === 'high').length },
          { label: 'Medium', color: 'bg-amber-500', count: tasks.filter(t => t.priority === 'medium').length },
          { label: 'Low', color: 'bg-emerald-500', count: tasks.filter(t => t.priority === 'low').length },
        ].map(({ label, color, count }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
            <span className="text-xs text-stone-600 flex-1">{label}</span>
            <span
              className="text-xs font-semibold text-stone-700"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  count,
  total,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-stone-600">
          {icon}
          {label}
        </span>
        <span
          className="text-xs font-semibold text-stone-700"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {count}
        </span>
      </div>
      <div className="h-1 bg-stone-100 rounded-full">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}