import { Router } from "express";
import userRoutes from "./api/user.routes";
import authorizationRoutes from "./api/authorization.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/authorization", authorizationRoutes);

export default router;
