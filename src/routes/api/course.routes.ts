import { Router } from "express";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import { getAll } from "../../features/courses/course.controller";
import { getByUuid } from "../../features/courses/course.controller";

const router = Router();

router.get("", getAll);
router.get("/:courseUuid", getByUuid);

export default router;
