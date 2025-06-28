import { Request, Response } from 'express';
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import Tasks  from "./tasks.model";
import { IUser } from 'interfaces/iuser.interface';

export const getAllTasksByCourseUUID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseuuid }  = req.params;
    const user = req.user?.id as number;
    let { filter } = req.query;

    if (!(filter === "today" || filter === "week" || filter === "month")) {
      res.status(400).json({ error: "Filter debe ser today, week or month" });
      return;
    }

    if (!courseuuid) {
      // Utilizar método get all (todas las del usuario, no del curso)
      const tasks = await Tasks.selectAllTasks(user, filter);
      res.status(200).json(tasks);
      return;
    }

    const tasks = await Tasks.selectAllTasksByCourseUuid(
      courseuuid,
      filter
    )

    res.status(200).json(tasks)

  } catch (error) {
      res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const getAllTasks = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user as IUser
    const userId = user.id
    let { filter } = req.query;

    if (!(filter === "today" || filter === "week" || filter === "month")) {
      res.status(400).json({ error: "Filter debe ser today, week or month" });
      return;
    }

    const tasks = await Tasks.selectAllTasks(userId, filter)
    res.status(200).json(tasks)
  } catch (error){
      res.status(500).json({
      status: "error",
      message: error,
    });
  }
}

export const createTask = async (

) => {

}

export const createTaskByTeacher = async (

) => {

}