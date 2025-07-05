import { Router } from "express";
import {
  getAllTasks,
  getAllTasksByCourseUUID,
  getAllTasksFiltered,
  createTask,
  createTaskByTeacher,
  updateTask,
  patchTaskUrgencyImportance,
  deleteTask,
} from "../../features/tasks/tasks.controller";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import { teacherRoleCheck } from "../../shared/middlewares/teacher_role_check.middleware";
import { generateUuidForSubtasks } from "../../features/tasks/tasks.middleware";

const router = Router();

router.get("", (req, res) => {
  if (req.query.filter) {
    return getAllTasksFiltered(req, res);
  }
  return getAllTasks(req, res);
});
router.get("/:courseuuid", getAllTasksByCourseUUID);

router.post("", generateUuid, generateUuidForSubtasks, createTask);
router.post(
  "/:courseuuid",
  teacherRoleCheck,
  generateUuid,
  generateUuidForSubtasks,
  createTaskByTeacher
);

router.put("/:task_uuid", updateTask);
router.patch("/:task_uuid", patchTaskUrgencyImportance);
router.delete("/:task_uuid", deleteTask);

export default router;
