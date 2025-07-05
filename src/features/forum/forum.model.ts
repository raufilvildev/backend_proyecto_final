import { IUser } from "interfaces/iuser.interface";
import db from "../../config/db.config";
import { IResThread } from "interfaces/iforum.interface";

export interface IPostThreadPayload {
  title: string;
  content: string;
  uuid: string;
}

export interface IPostResponsePayload {
  content: string;
  user?: IUser;
  uuid: string;
  title: string;
}

interface User {
  uuid: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  role: "student" | "teacher" | "general";
}

interface Response {
  uuid: string;
  user: User;
  content: string;
  created_at: Date;
  updated_at: Date;
}

interface Thread {
  uuid: string;
  user: User;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  responses: Response[];
}

export const selectAllThreadsWithReplies = async (
  order: "asc" | "desc",
  courseUuid: string
): Promise<any[]> => {
  try {
    const orderClause = order === "asc" ? "ASC" : "DESC";

    const selectAllThreadsQuery = `  SELECT
          ft.id AS thread_id,
          ft.uuid,
          ft.title,
          ft.content,
          ft.created_at,
          ft.updated_at,
          u.uuid AS user_uuid,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.role
      FROM
          forum_threads AS ft
      JOIN
          users AS u ON ft.user_id = u.id
      JOIN
          courses AS c ON ft.course_id = c.id
      WHERE
          c.uuid = ?
      ORDER BY
          ft.created_at ${orderClause}`;

    const selectAllResponsesQuery = `SELECT
          fp.thread_id,
          fp.uuid,
          fp.content,
          fp.created_at,
          fp.updated_at,
          u.uuid AS user_uuid,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.role
      FROM
          forum_posts AS fp
      JOIN
          users AS u ON fp.user_id = u.id
      WHERE
          fp.thread_id IN (
              SELECT ft.id
              FROM forum_threads ft
              JOIN courses c ON ft.course_id = c.id
              WHERE c.uuid = ?
          )
              ORDER BY fp.created_at ASC;`;

    const [[threadsResult], [responsesData]] = await Promise.all([
      db.query(selectAllThreadsQuery, [courseUuid]),
      db.query(selectAllResponsesQuery, [courseUuid]),
    ]);

    const threadsMap = new Map<number, IResThread>();

    for (const thread of threadsResult as any[]) {
      threadsMap.set(thread.thread_id, {
        uuid: thread.uuid,
        user: {
          uuid: thread.user_uuid,
          first_name: thread.first_name,
          last_name: thread.last_name,
          profile_image_url: thread.profile_image_url,
          role: thread.role,
        },
        title: thread.title,
        created_at: thread.created_at,
        updated_at: thread.updated_at,
        content: thread.content,
        responses: [],
      });
    }

    for (const responseItem of responsesData as any[]) {
      const parentThread = threadsMap.get(responseItem.thread_id);
      if (parentThread) {
        parentThread.responses.push({
          uuid: responseItem.uuid,
          user: {
            uuid: responseItem.user_uuid,
            first_name: responseItem.first_name,
            last_name: responseItem.last_name,
            profile_image_url: responseItem.profile_image_url,
            role: responseItem.role,
          },
          content: responseItem.content,
          created_at: responseItem.created_at,
          updated_at: responseItem.updated_at,
        });
      }
    }

    return Array.from(threadsMap.values());
  } catch (error) {
    throw error;
  }
};

export const selectThreadByUuid = async (uuid: string) => {
  const [result] = await db.query(
    "select * from forum_threads where uuid = ?",
    [uuid]
  );
  return result;
};

export const selectResponseByUuid = async (uuid: string) => {
  const [result] = await db.query("select * from forum_posts where uuid = ?", [
    uuid,
  ]);
  return result;
};

export const selectResponseByUserIdAndContent = async (
  userId: number,
  content: string
) => {
  const [result] = await db.query(
    "select * from forum_posts where content = ? AND user_id = ?",
    [content, userId]
  );
  return result;
};

export const insertThread = async (
  courseUuid: string,
  title: string,
  content: string,
  userId: number,
  uuid: string
) => {
  const [result] = await db.query(
    `INSERT INTO forum_threads (uuid, course_id, user_id, title, content, created_at, updated_at)
VALUES (
    ?,
    (SELECT id FROM courses WHERE uuid = ?),
    ?,
    ?,
    ?, 
    NOW(),
    NOW() )
`,
    [uuid, courseUuid, userId, title, content]
  );
  return result;
};

export const insertResponse = async (
  userId: number,
  uuid: string,
  content: string,
  threadUuid: string
) => {
  const [result] = await db.query(
    `INSERT into forum_posts (uuid, thread_id, user_id, content, created_at, updated_at)
    VALUES (?, 
    (SELECT id FROM forum_threads WHERE uuid = ?),
    ?, 
    ?,
     NOW(), 
     NOW())
    `,
    [uuid, threadUuid, userId, content]
  );

  return result;
};

export const editThread = async (
  uuid: string,
  title: string,
  content: string
) => {
  const [result] = await db.query(
    `UPDATE forum_threads
    SET content = ?, title = ?, updated_at = NOW()
    WHERE uuid = ?`,
    [content, title, uuid]
  );
  return result;
};

export const editResponse = async (userId: number, content: string) => {
  const [result] = await db.query(
    `UPDATE forum_posts
    SET content = ?, updated_at = NOW()
    WHERE user_id = ?`,
    [content, userId]
  );
  return result;
};

export const deleteThread = async (uuid: string) => {
  const [result] = await db.query(
    `DELETE FROM forum_threads
    WHERE uuid = ?`,
    [uuid]
  );
  return result;
};

export const deleteResponse = async (uuid: string) => {
  const [result] = await db.query(
    `DELETE FROM forum_posts
    WHERE uuid = ?`,
    [uuid]
  );
  return result;
};

export default {
  selectAllThreadsWithReplies,
  insertThread,
  selectThreadByUuid,
  selectResponseByUserIdAndContent,
  insertResponse,
  selectResponseByUuid,
  editThread,
  editResponse,
  deleteThread,
  deleteResponse,
};
