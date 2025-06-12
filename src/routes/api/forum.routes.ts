import { Router } from "express";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
// import { getAllThreads } from "../../features/forum/forum.controller";

const router = Router();

// router.get("", checkToken, getAllThreads);

export default router;
