import { Router } from "express";
import {
  getById,
  create,
  changePassword,
  login,
  remove,
} from "../../features/users/user.controller";
import { checkUserExists } from "../../features/users/user.middleware";
import { checkToken } from "../../features/authorization/authorization.middleware";

const router = Router();

router.get("", checkToken, getById);

router.post("/signup", checkUserExists(["email", "username"]), create);
router.post("/login", login);

router.patch("/login/change_password", checkToken, changePassword);

router.delete("", checkToken, remove);

export default router;
