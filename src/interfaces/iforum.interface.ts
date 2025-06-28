import { IUser } from "./iuser.interface";

// SQL TABLES

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

//

// Rersponse interfaces

export interface IResUser {
  uuid: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  role: "student" | "teacher" | "general";
}

export interface IResResponse {
  uuid: string;
  user: IResUser;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface IResThread {
  uuid: string;
  user: IResUser;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  responses: IResResponse[];
}

export interface IPostThreadPayload {
  title: string;
  content: string;
  uuid: string;
}

export interface IPostResponsePayload {
  content: string;
  title: string;
  user?: IUser;
  uuid: string;
}

export interface IPutResponsePayload {
  content: string;
  user: IUser;
}
