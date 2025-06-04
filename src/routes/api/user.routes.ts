import { Router } from "express";
import {
  getById,
  create,
  changePassword,
  login,
  remove,
} from "../../controllers/user.controller";
import { checkUserExists } from "../../middlewares/user.middleware";
import { checkToken } from "../../middlewares/authorization.middleware";

const router = Router();

router.get("", checkToken, getById);

router.post("/signup", checkUserExists(["email", "username"]), create);
router.post("/login", login);

router.patch("/login/change_password", checkToken, changePassword);

router.delete("", checkToken, remove);

export default router;
