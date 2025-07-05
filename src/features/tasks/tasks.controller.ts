import { Request, Response } from "express";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import Tasks from "./tasks.model";
import { IUser } from "../../interfaces/iuser.interface";
import {
  ISubtasksInsertData,
  ITaskInsertData,
} from "../../interfaces/itask.interface";
import Courses from "../../features/courses/course.model";

export const getAllTasksByCourseUUID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseuuid } = req.params;
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

    const tasks = await Tasks.selectAllTasksByCourseUuid(courseuuid, filter);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user.id;
    let { filter } = req.query;

    if (!(filter === "today" || filter === "week" || filter === "month")) {
      res.status(400).json({ error: "Filter debe ser today, week or month" });
      return;
    }

    const tasks = await Tasks.selectAllTasks(userId, filter);
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
    console.log("[createTask] User ID:", userId);

    const {
      uuid,
      title,
      description,
      due_date,
      time_start,
      time_estimated,
      is_urgent,
      is_important,
      subtasks,
    } = req.body;

    const time_end = time_start + time_estimated;

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
    console.log("[createTask] Task data to insert:", taskInsertData);

    const subTaskInsertData: ISubtasksInsertData[] = Array.isArray(subtasks)
      ? subtasks
      : [];
    console.log("[createTask] Subtasks to insert:", subTaskInsertData);

    const newTask = await Tasks.createTask(
      userId,
      taskInsertData,
      subTaskInsertData
    );
    console.log("[createTask] Task created successfully:", newTask);

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
      time_estimated,
      is_urgent,
      is_important,
      subtasks,
    } = req.body;

    const course = await Courses.selectByUuid(courseuuid, user);

    const course_id = course?.id;

    const time_end = time_start + time_estimated;

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
        course_id,
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
        userId,
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
    } = req.body;

    const updatedTask = await Tasks.updateTask(task_uuid, {
      uuid: task_uuid,
      title,
      description,
      due_date,
      time_start,
      time_end,
      category,
      is_urgent,
      is_important,
      subtasks: [],
    });

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
