import { Request, Response } from "express";
import { IForumThread, IForumPost } from "../../interfaces/iforum.interface";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import { selectAllThreads } from "./forum.model";

export const getAllThreadsWithReplies = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const threads = await selectAllThreads();
};
