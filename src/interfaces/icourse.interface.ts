export interface ICourse {
  id: number;
  uuid: string;
  teacher_id: number;
  title: string;
  description?: string;
  planning?: string;
  course_image_url?: string;
  created_at?: string;
  updated_at?: string;
}
