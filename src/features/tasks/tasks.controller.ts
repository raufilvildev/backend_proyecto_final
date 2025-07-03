import { Request, Response } from 'express';
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import Tasks  from "./tasks.model";
import { IUser } from 'interfaces/iuser.interface';
import { ISubtasksInsertData, ITaskInsertData } from 'interfaces/itask.interface';
import { error } from 'console';

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
  req: Request,
  res: Response
) => {
  try {
    const user = req.user as IUser
    const userId = user.id
    const { uuid, course_id, title, description, due_date, time_start, time_end, category, is_urgent, is_important, subtasks} = req.body

    if (!userId) {
      res.status(400).json({ error: "El User Id es obligatorio"});
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title es requerido." });
      return;
    }

    const taskInsertData : ITaskInsertData = {
      uuid,
      course_id,
      title,
      description,
      due_date,
      time_start,
      time_end,
      category,
      is_urgent,
      is_important,
      subtasks
    }

    const subTaskInsertData: ISubtasksInsertData[] = Array.isArray(subtasks) ? subtasks : [];

    const newTask = await Tasks.createTask(userId, taskInsertData, subTaskInsertData);

    res.status(200).json(newTask);

  } catch (error) {
      res.status(500).json({
      status: "error",
      message: error,
    });
  }
}

export const createTaskByTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    
    const { courseuuid } = req.params
    const user = req.user as IUser
    const role = user.role
    const userId = user.id
    const { uuid, course_id, title, description, due_date, time_start, time_end, category, is_urgent, is_important, subtasks} = req.body
    if (!courseuuid) {
      res.status(400).json({ error: "El course_uuid es obligatorio"})
      return
    }

    if (!userId) {
        res.status(400).json({ error: "El User Id es obligatorio"});
        return;
      }

    if (!title) {
      res.status(400).json({ error: "Title es requerido." });
      return;
    }

    if (role === "teacher") {
      const taskInsertData : ITaskInsertData = {
        uuid,
        course_id,
        title,
        description,
        due_date,
        time_start,
        time_end,
        category,
        is_urgent,
        is_important,
        subtasks
      }

    const subTaskInsertData: ISubtasksInsertData[] = Array.isArray(subtasks) ? subtasks : [];

    const newTask = await Tasks.createTaskByTeacher(courseuuid, userId, taskInsertData, subTaskInsertData)

    res.status(200).json(newTask);
    } else {
      res.status(400).json({ error: "Solo pueden crear estas tareas los profesores"})
    }
  } catch (error) {
      res.status(500).json({
      status: "error",
      message: error,
    });
  }
}