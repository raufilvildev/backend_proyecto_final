export interface ITask {
  id: number;
  uuid: string;
  user_id: number;
  course_id?: number;
  category: "custom" | "course_related";
  title: string;
  description?: string;
  due_date?: string;
  time_start?: string;
  time_end?: string;
  is_urgent: boolean;
  is_important: boolean;
  priority_color: "neutral" | "yellow" | "red";
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ISubtask {
  id: number;
  uuid: string;
  task_id: number;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITaskInsertData {
  uuid: string;
  course_id?: number | null;
  title: string;
  description: string;
  due_date: string;
  time_start: string;
  time_end: string;
  category?: "custom" | "course_related";
  is_urgent: boolean;
  is_important: boolean;
  is_completed?: boolean;
  subtasks?: [];
}

export interface ISubtasksInsertData {
  uuid: string;
  task_id: number;
  title: string;
}
