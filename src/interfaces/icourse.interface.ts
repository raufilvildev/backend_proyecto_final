export interface ICourse {
  id: number;
  uuid: string;
  teacher_id: number;
  title: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
