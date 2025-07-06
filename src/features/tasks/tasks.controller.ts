import { Request, Response } from "express";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import Tasks from "./tasks.model";
import { IUser } from "../../interfaces/iuser.interface";
import {
  ISubtasksInsertData,
  ITaskInsertData,
} from "../../interfaces/itask.interface";

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user.id;

    const tasks = await Tasks.selectAllTasks(userId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const getAllTasksByCourseUUID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseuuid } = req.params;
    const user = req.user?.id as number;
    const filter = req.query.filter as "today" | "week" | "month" | undefined;

    // Validar que el usuario existe
    if (!user) {
      res.status(401).json({ error: "Usuario no autenticado" });
      return;
    }

    // Validar el filtro si existe
    if (filter && !["today", "week", "month"].includes(filter)) {
      res.status(400).json({ error: "Filter debe ser today, week o month" });
      return;
    }

    if (!courseuuid) {
      // Utilizar método get all (todas las del usuario, no del curso)
      const tasks = await Tasks.selectAllTasksFiltered(user, filter as "today" | "week" | "month");
      res.status(200).json(tasks);
      return;
    }

    const tasks = await Tasks.selectAllTasksByCourseUuid(courseuuid, filter);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const getAllTasksFiltered = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user.id;
    let { filter } = req.query;
    if (Array.isArray(filter)) filter = filter[0];

    if (!(filter === "today" || filter === "week" || filter === "month")) {
      res.status(400).json({ error: "Filter debe ser today, week or month" });
      return;
    }

    const tasks = await Tasks.selectAllTasksFiltered(
      userId,
      filter as "today" | "week" | "month"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user.id;

    const {
      uuid,
      title,
      description,
      due_date,
      time_start,
      time_end,
      is_urgent,
      is_important,
      subtasks,
    } = req.body;

    if (!userId) {
      res.status(400).json({ error: "El User Id es obligatorio" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title es requerido." });
      return;
    }

    let formattedDueDate = due_date;
    if (due_date && typeof due_date === "string") {
      formattedDueDate = new Date(due_date).toISOString().split("T")[0];
    }

    const taskInsertData: ITaskInsertData = {
      uuid,
      course_id: null,
      title,
      description,
      due_date: formattedDueDate,
      time_start,
      time_end,
      category: "custom",
      is_urgent,
      is_important,

      subtasks,
    };

    const subTaskInsertData: ISubtasksInsertData[] = Array.isArray(subtasks)
      ? subtasks
      : [];

    const newTask = await Tasks.createTask(
      userId,
      taskInsertData,
      subTaskInsertData
    );

    res.status(200).json(newTask);
  } catch (error) {
    console.error("[createTask] Error creating task:", error);
    res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createTaskByTeacher = async (req: Request, res: Response) => {
  try {
    const { courseuuid } = req.params;
    const user = req.user as IUser;
    const role = user.role;
    const userId = user.id;
    const {
      uuid,
      title,
      description,
      due_date,
      time_start,
      time_end,
      is_urgent,
      is_important,
      subtasks,
    } = req.body;

    if (!courseuuid) {
      res.status(400).json({ error: "El course_uuid es obligatorio" });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: "El User Id es obligatorio" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title es requerido." });
      return;
    }

    if (role === "teacher") {
      const taskInsertData: ITaskInsertData = {
        uuid,
        title,
        description,
        due_date,
        time_start,
        time_end,
        category: "course_related",
        is_urgent,
        is_important,
        subtasks,
      };

      const subTaskInsertData: ISubtasksInsertData[] = Array.isArray(subtasks)
        ? subtasks
        : [];

      const newTask = await Tasks.createTaskByTeacher(
        courseuuid,
        user,
        taskInsertData,
        subTaskInsertData
      );

      res.status(200).json(newTask);
    } else {
      res
        .status(400)
        .json({ error: "Solo pueden crear estas tareas los profesores" });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { task_uuid } = req.params;
    const {
      title,
      description,
      due_date,
      time_start,
      time_end,
      category,
      is_urgent,
      is_important,
      is_completed,
      subtasks,
    } = req.body;

    const updatedTask = await Tasks.updateTask(
      task_uuid,
      {
        uuid: task_uuid,
        title,
        description,
        due_date,
        time_start,
        time_end,
        category,
        is_urgent,
        is_important,
        is_completed,
      },
      subtasks
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const patchTaskUrgencyImportance = async (
  req: Request,
  res: Response
) => {
  try {
    const { task_uuid } = req.params;
    const { is_urgent, is_important } = req.body;

    if (typeof is_urgent !== "boolean" || typeof is_important !== "boolean") {
      res.status(400).json({ error: "Los valores deben ser booleanos." });
      return;
    }

    const updatedTask = await Tasks.patchUrgencyImportance(
      task_uuid,
      is_urgent,
      is_important
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { task_uuid } = req.params;

    const deletedTask = await Tasks.deleteTask(task_uuid);

    if (!deletedTask) {
      res.status(404).json({ error: "Tarea no encontrada." });
      return;
    }

    res.status(200).json({
      message: `Tarea '${deletedTask.title}' eliminada exitosamente.`,
      deletedTask,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};
