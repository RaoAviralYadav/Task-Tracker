export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  tags?: string[];
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface FilterState {
  status: Status | 'all';
  priority: Priority | 'all';
  search: string;
}

export type SortField = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
