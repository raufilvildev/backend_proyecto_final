export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string;
  username: string;
  password?: string;
  notify_by_email?: boolean;
  email_confirmed?: boolean;
  random_number?: string;
  role: "general" | "student" | "teacher";
  created_at?: "string";
  updated_at?: "string";
  deleted_at?: "string";
}
