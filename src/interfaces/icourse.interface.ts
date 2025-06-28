export interface IEnrolledStudent {
  uuid: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  email: string;
  username: string;
}

export interface ICourse {
  id: number;
  uuid: string;
  teacher_id: number;
  title: string;
  description: string;
  planning: any;
  course_image_url: string;
  created_at: string;
  updated_at: string;
  teacher: string;
  students?: IEnrolledStudent[];
}

export interface ICourseInsertData {
  uuid: string;
  teacher_id: number;
  title: string;
  description?: string;
  course_image_url?: string;
  planning?: any;
}

export interface ICourseUpdateData {
  title?: string;
  description?: string;
  course_image_url?: string;
  planning?: any;
}

export interface IUnitCourse {
  title: string;
  sections: {
    title: string;
  }[];
}
