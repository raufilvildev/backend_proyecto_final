import { Router } from "express";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import { getAllThreadsWithRepliesAndUsers } from "../../features/forum/forum.controller";

const router = Router();

router.get("/:courseUuid", getAllThreadsWithRepliesAndUsers);

export default router;
