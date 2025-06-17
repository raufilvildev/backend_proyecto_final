import { Router } from "express";
import {
  create,
  changePassword,
  login,
  remove,
  getByUuid,
  getByEmail,
  edit,
  editEmail,
} from "../../features/users/user.controller";
import { checkUserExists } from "../../features/users/user.middleware";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { generateUuid } from "../../shared/middlewares/uuid_generate.middleware";
import multer from "multer";

const upload = multer({ dest: "public/uploads/users/" });
const router = Router();

router.get("/email/:user_email", checkToken, getByEmail);
router.get("", checkToken, getByUuid);

router.post(
  "/signup",
  checkUserExists(["email", "username"]),
  generateUuid,
  create
);
router.post("/login", login);

router.put("/update", upload.single("profile-image"), checkToken, edit);

router.patch("/update/email", checkToken, editEmail);
router.patch("/login/change_password", checkToken, changePassword);

router.delete("", checkToken, remove);

export default router;
