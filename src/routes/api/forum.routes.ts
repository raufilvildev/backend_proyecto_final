import { Router } from "express";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";

const router = Router();

// router.get("", checkToken, getAllThreads);

export default router;
