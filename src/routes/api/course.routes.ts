import { Router } from "express";
import multer from "multer";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import {
  create,
  getAll,
  getByUuid,
  update,
  remove,
  exportAsPdf,
} from "../../features/courses/course.controller";
import { teacherRoleCheck } from "../../shared/middlewares/teacher_role_check.middleware";

const upload = multer({ dest: "public/uploads/courses/" });
const router = Router();

router.get("", getAll);
router.get("/:courseUuid", getByUuid);
router.get("/:courseUuid/export-pdf", exportAsPdf);

router.post(
  "",
  upload.single("course-image"),
  teacherRoleCheck,
  generateUuid,
  create
);

router.put("", upload.single("course-image"), teacherRoleCheck, update);

router.delete("/:courseUuid", teacherRoleCheck, remove);

export default router;
