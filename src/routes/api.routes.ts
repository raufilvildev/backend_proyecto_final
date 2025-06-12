import { Router } from "express";
import userRoutes from "./api/user.routes";
import authorizationRoutes from "./api/authorization.routes";
import courseRoutes from "./api/course.routes";
import forumRoutes from "./api/forum.routes";
import { checkToken } from "../features/authorization/authorization.middleware";

const router = Router();

router.use("/user", userRoutes);
router.use("/authorization", authorizationRoutes);
router.use("/courses", checkToken, courseRoutes);
router.use("/forum", checkToken, forumRoutes);

export default router;
