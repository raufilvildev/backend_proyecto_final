import { Request, Response } from "express";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";

import Forum from "./forum.model";
import {
  IPostResponsePayload,
  IPostThreadPayload,
  IPutResponsePayload,
} from "../../interfaces/iforum.interface";

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
      res.status(400).json({ error: "Titulo requerido" });
      return;
    }
    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Contenido del thread requerido" });
      return;
    }

    await Forum.insertThread(courseUuid, title, content, user.id, uuid);

    const newThreadDetails = await Forum.selectThreadByUuid(uuid);

    res.status(201).json(newThreadDetails);
  } catch (error) {
    console.error("Error en postThread controller:", error);

    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export const postResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { threadUuid } = req.params;
    const { content, uuid } = req.body as IPostResponsePayload;

    if (!threadUuid) {
      res.status(400).json({ error: "Thread UUID requerido" });
      return;
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Contenido del thread requerido" });
      return;
    }

    await Forum.insertResponse(user.id, uuid, content, threadUuid);

    const newResponseDetails = await Forum.selectResponseByUuid(uuid);

    res.status(201).json(newResponseDetails);
  } catch (error) {
    console.error("Error en postResponse controller:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export const editThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, title, uuid } = req.body as IPostResponsePayload;

    if (!uuid) {
      res.status(400).json({ error: "Thread UUID requerido" });
      return;
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Contenido del thread requerido" });
      return;
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ error: "Titulo del thread requerido" });
      return;
    }

    await Forum.editThread(uuid, title, content);

    const newResponseDetails = await Forum.selectThreadByUuid(uuid);

    res.status(201).json(newResponseDetails);
  } catch (error) {
    console.error("Error en editThread controller:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export const editResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, user } = req.body as IPutResponsePayload;

    if (!user) {
      res.status(400).json({ error: "Informacion de usuario requerido" });
      return;
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Contenido de la response requerido" });
      return;
    }

    const response = await Forum.editResponse(user.id, content);

    const newResponseDetails = await Forum.selectResponseByUserIdAndContent(
      user.id,
      content
    );

    res.status(201).json(newResponseDetails);
  } catch (error) {
    console.error("Error en editResponse controller:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export const deleteThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadUuid } = req.params;

    if (!threadUuid) {
      res.status(400).json({ error: "Thread UUID requerido" });
      return;
    }

    if (!Forum.selectThreadByUuid(threadUuid)) {
      res.status(404).json({ error: "No se encontró un hilo con ese id." });
      return;
    }

    await Forum.deleteThread(threadUuid);
    res.status(201).json({
      error: `Se ha eliminado correctamente el hilo con uuid ${threadUuid}`,
    });
  } catch (error) {
    console.error("Error en deleteThread controller:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export const deleteResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { responseUuid } = req.params;

    if (!responseUuid) {
      res.status(400).json({ error: "Response UUID requerido" });
      return;
    }

    if (!Forum.selectResponseByUuid(responseUuid)) {
      res
        .status(404)
        .json({ error: "No se encontró una respuesta con ese id." });
      return;
    }

    await Forum.deleteResponse(responseUuid);
    res.status(201).json({
      error: `Se ha eliminado correctamente la respuesta con uuid ${responseUuid}`,
    });
  } catch (error) {
    console.error("Error en deleteResponse controller:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export default {
  getAllThreadsWithRepliesAndUsers,
  postThread,
  postResponse,
  editResponse,
  deleteResponse,
};
