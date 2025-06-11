import { Router } from "express";
import userRoutes from "./api/user.routes";
import authorizationRoutes from "./api/authorization.routes";
import courseRoutes from "./api/course.routes";
import forumRoutes from "./api/forum.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/authorization", authorizationRoutes);
router.use("/courses", courseRoutes);
router.use("/forum", forumRoutes);

export default router;
