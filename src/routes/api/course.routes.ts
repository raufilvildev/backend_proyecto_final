import { Router } from "express";
import multer from "multer";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import {
  create,
  getAll,
  getByUuid,
} from "../../features/courses/course.controller";
import { teacherRoleCheck } from "shared/middlewares/teacher_role_check.middleware";

const upload = multer({ dest: "public/uploads/courses/" });
const router = Router();

router.get("", getAll);
router.get("/:courseUuid", getByUuid);

router.post(
  "",
  teacherRoleCheck,
  generateUuid,
  upload.single("course-image"),
  create
);

export default router;
