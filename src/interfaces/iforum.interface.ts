export interface IForumThread {
  id: number;
  uuid: string;
  course_id: number;
  user_id: number;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface IForumPost {
  id: number;
  uuid: string;
  thread_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}
