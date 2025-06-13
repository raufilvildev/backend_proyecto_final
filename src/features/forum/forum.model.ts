import { IForumThread, IForumPost } from "../../interfaces/iforum.interface";
import db from "../../config/db.config";

interface User {
  uuid: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  role: "student" | "teacher" | "general";
}

interface Reply {
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
  responses: Reply[];
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
          );`;

    const [[threadsResult], [responsesResult]] = await Promise.all([
      db.query(selectAllThreadsQuery, [courseUuid]),
      db.query(selectAllResponsesQuery, [courseUuid]),
    ]);

    const threadsMap = new Map<number, Thread>();

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

    for (const reply of responsesResult as any[]) {
      const parentThread = threadsMap.get(reply.thread_id);
      if (parentThread) {
        parentThread.responses.push({
          uuid: reply.uuid,
          user: {
            uuid: reply.user_uuid,
            first_name: reply.first_name,
            last_name: reply.last_name,
            profile_image_url: reply.profile_image_url,
            role: reply.role,
          },
          content: reply.content,
          created_at: reply.created_at,
          updated_at: reply.updated_at,
        });
      }
    }

    return Array.from(threadsMap.values());
  } catch (error) {
    throw error;
  }
};

export default { selectAllThreadsWithReplies };
