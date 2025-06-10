import { Router } from "express";
import userRoutes from "./api/user.routes";
import authorizationRoutes from "./api/authorization.routes";
import courseRoutes from "./api/course.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/authorization", authorizationRoutes);
router.use("/courses", courseRoutes);

export default router;
