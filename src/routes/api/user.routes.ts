import { Router } from "express";
import {
  create,
  changePassword,
  login,
  remove,
  getByUuid,
} from "../../features/users/user.controller";
import { checkUserExists } from "../../features/users/user.middleware";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";

const router = Router();

router.get("", checkToken, getByUuid);

router.post(
  "/signup",
  checkUserExists(["email", "username"]),
  generateUuid,
  create
);
router.post("/login", login);

router.patch("/login/change_password", checkToken, changePassword);

router.delete("", checkToken, remove);

export default router;
