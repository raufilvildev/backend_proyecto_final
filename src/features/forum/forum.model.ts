import { IForumThread, IForumPost } from "../../interfaces/iforum.interface";
import db from "../../config/db.config";

export const selectAllThreads = async (): Promise<IForumThread[]> => {
  // Your implementation here
  try {
    const result = await db.query(`
      SELECT * FROM forum_threads 
      ORDER BY created_at DESC WHERE 
    `);

    console.log(result);

    return [];
  } catch (error) {
    throw error;
  }
};
