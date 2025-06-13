import { Request, Response } from "express";
import { IForumThread, IForumPost } from "../../interfaces/iforum.interface";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import { selectAllThreadsWithReplies } from "./forum.model";

export const getAllThreadsWithRepliesAndUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { courseUuid } = req.params;
    const { order } = req.query;

    if (!courseUuid) {
      res.status(400).json({ error: "Course UUID is required" });
      return;
    }

    const validOrder =
      typeof order === "string" && (order === "asc" || order === "desc")
        ? order
        : "desc";

    const threads = await selectAllThreadsWithReplies(validOrder, courseUuid);

    if (threads.length === 0) {
      res.status(200).json({
        message: "No hay hilos de discusión en este curso",
        threads: [],
        order: validOrder,
      });
      return;
    }

    res.status(200).json(threads);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export default { getAllThreadsWithRepliesAndUsers };
