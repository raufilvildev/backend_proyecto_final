import { Router } from "express";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import {
  getAllThreadsWithRepliesAndUsers,
  postThread,
  postResponse,
  editThread,
  editResponse,
  deleteThread,
  deleteResponse,
} from "../../features/forum/forum.controller";

const router = Router();

router.get("/:courseUuid", getAllThreadsWithRepliesAndUsers);

router.post("/post/thread/:courseUuid", generateUuid, postThread);
router.post("/post/response/:threadUuid", generateUuid, postResponse);

router.put("/update/thread/", editThread);
router.put("/update/response/", editResponse);

router.delete("/delete/thread/:threadUuid", deleteThread);
router.delete("/delete/response/:responseUuid", deleteResponse);

export default router;
