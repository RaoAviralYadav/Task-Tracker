import { Task, CreateTaskDto, UpdateTaskDto } from '@/types';

// ── Switch to false for offline/demo mode ────────────────────────────────────
const USE_REAL_API = true;
// Vite proxy in vite.config.ts forwards /api → http://localhost:5000
const API_BASE = import.meta.env.VITE_API_URL + '/api';

// ─── localStorage Mock ───────────────────────────────────────────────────────
const STORAGE_KEY = 'task_tracker_tasks';
function genId(): string { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function loadTasks(): Task[] { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveTasks(t: Task[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

const mockApi = {
  async getTasks() { await delay(); return loadTasks(); },
  async createTask(dto: CreateTaskDto): Promise<Task> {
    await delay(); const tasks = loadTasks(); const now = new Date().toISOString();
    const task: Task = { _id: genId(), ...dto, createdAt: now, updatedAt: now };
    tasks.unshift(task); saveTasks(tasks); return task;
  },
  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    await delay(); const tasks = loadTasks(); const idx = tasks.findIndex(t => t._id === id);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], ...dto, updatedAt: new Date().toISOString() };
    saveTasks(tasks); return tasks[idx];
  },
  async deleteTask(id: string) { await delay(); saveTasks(loadTasks().filter(t => t._id !== id)); },
};

// ─── Real API ─────────────────────────────────────────────────────────────────
const realApi = {
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.tasks ?? []);
  },
  async createTask(dto: CreateTaskDto): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to create task'); }
    return res.json();
  },
  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to update task'); }
    return res.json();
  },
  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to delete task'); }
  },
};

export const api = USE_REAL_API ? realApi : mockApi;
