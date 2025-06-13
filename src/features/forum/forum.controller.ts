import { Request, Response } from "express";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import Forum, { IPostThreadPayload } from "./forum.model";

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

    const threads = await Forum.selectAllThreadsWithReplies(
      validOrder,
      courseUuid
    );

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

export const postThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { courseUuid } = req.params;
    const { title, content, uuid } = req.body as IPostThreadPayload;

    if (!courseUuid) {
      res.status(400).json({ error: "Curso UUID requerido" });
      return;
    }
    if (!title || typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ error: "Title requerido" });
      return;
    }
    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Contenido del thraed requerido" });
      return;
    }

    await Forum.insertThread(courseUuid, title, content, user.id, uuid);

    const newThreadDetails = await Forum.selectThreadByUuid(uuid);

    res.status(201).json(newThreadDetails);
  } catch (error) {
    console.error("Error in postThread controller:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export default { getAllThreadsWithRepliesAndUsers, postThread };
