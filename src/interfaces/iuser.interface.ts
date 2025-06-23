export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string;
  username: string;
  password?: string;
  profile_image_url?: string;
  notify_by_email?: 0 | 1;
  email_confirmed?: boolean;
  random_number?: string;
  role: "general" | "student" | "teacher";
  uuid: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
