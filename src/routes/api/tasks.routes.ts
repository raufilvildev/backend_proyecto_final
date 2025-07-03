import { Router } from "express";
import {
  getAllTasksByCourseUUID,
  getAllTasks,
  createTask,
  createTaskByTeacher,
  getAllTasksGroupedByCourses,
  updateTask,
  patchTaskPriority,
  deleteTask
} from "../../features/tasks/tasks.controller";import { checkToken } from "../../features/authorization/authorization.middleware";

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


// ✅ Rutas más específicas van primero
router.get("/courses", checkToken, getAllTasksGroupedByCourses);
router.get("/course/:courseuuid", checkToken, getAllTasksByCourseUUID);

// ✅ Rutas generales van después
router.get("/", checkToken, getAllTasks);

// POST tarea para usuario
router.post("/", checkToken, createTask);

// POST tarea para curso (solo profesor)
router.post("/:courseuuid", checkToken, createTaskByTeacher);

// PUT actualizar tarea completa
router.put("/:task_uuid", checkToken, updateTask);

// PATCH urgencia/importancia
router.patch("/:task_uuid", checkToken, patchTaskPriority);

// DELETE tarea
router.delete("/:task_uuid", checkToken, deleteTask);

export default router;
