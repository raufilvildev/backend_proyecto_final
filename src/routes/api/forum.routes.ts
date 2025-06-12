import { Router } from "express";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import { getAllThreadsWithReplies } from "../../features/forum/forum.controller";

const router = Router();

router.get("", getAllThreadsWithReplies);

export default router;
