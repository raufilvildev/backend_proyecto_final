import { Router } from "express";
import userRoutes from "./api/user.routes";
import authorizationRoutes from "./api/authorization.routes";
import courseRoutes from "./api/course.routes";
import forumRoutes from "./api/forum.routes";
import tasksRoutes from "./api/tasks.routes";
import { checkToken } from "../features/authorization/authorization.middleware";
import { generalRoleCheck } from "../shared/middlewares/general_role_check.middleware";

const router = Router();

router.use("/user", userRoutes);
router.use("/authorization", authorizationRoutes);
router.use("/courses", checkToken, generalRoleCheck, courseRoutes);
router.use("/forum", checkToken, generalRoleCheck, forumRoutes);
router.use("/tasks", checkToken, tasksRoutes);

export default router;
