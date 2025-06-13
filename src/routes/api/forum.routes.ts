import { Router } from "express";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import {
  getAllThreadsWithRepliesAndUsers,
  postThread,
} from "../../features/forum/forum.controller";

const router = Router();

router.get("/:courseUuid", getAllThreadsWithRepliesAndUsers);
router.post("/post/thread/:courseUuid", generateUuid, postThread);

export default router;
