import { Router } from "express";
import {
  getAllTasksByCourseUUID,
  getAllTasks,
  createTask,
  createTaskByTeacher,
  updateTask,
  patchTaskUrgencyImportance,
  deleteTask,
} from "../../features/tasks/tasks.controller";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";

const router = Router();

// GET api/tasks?filter=today|week|month -> getAll (si filter=today, mostrar también tareas pasadas no completadas)
// GET api/tasks/:course_uuid?filter=today|week|month -> getTasksByCourseUuid (si filter=today, mostrar también tareas pasadas no completadas)
// GET api/tasks/courses?filter=today|week|month ->

// ¡¡Devolver una advertencia de que existe solapamiento de horarios!!
// POST api/tasks -> Se asigna al usuario.
// POST api/tasks/?course_uuid -> Solo la puede hacer el profesor y se debe asignar tanto al profesor como a sus alumnos.

// UPDATE api/tasks/:task_uuid -> Actualiza una tarea completa
// PATCH api/tasks/:task_uuid -> Actualiza urgencia e importancia de la tarea

// DELETE api/tasks/:task_uuid

router.get("", getAllTasks);
router.get("/:courseuuid", getAllTasksByCourseUUID);

router.post("", generateUuid, createTask);
router.post("/:courseuuid", generateUuid, createTaskByTeacher);

router.put("/:task_uuid", updateTask);
router.patch("/:task_uuid", patchTaskUrgencyImportance);
router.delete("/:task_uuid", deleteTask);

export default router;
