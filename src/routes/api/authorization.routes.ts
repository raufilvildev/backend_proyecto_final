import { Router } from "express";
import {
  requestConfirmationByEmail,
  resetRandomNumber,
  checkRandomNumberInput,
  returnToken,
} from "../../features/authorization/authorization.controller";
import { checkToken } from "../../features/authorization/authorization.middleware";
import { checkUserExists } from "../../features/users/user.middleware";

const router = Router();

router.post(
  "/email_confirmation/request/:type",
  checkToken,
  requestConfirmationByEmail
);
router.post("/email_confirmation", checkToken, checkRandomNumberInput);
router.post("/check_email", checkUserExists(["email"], true), returnToken);

router.patch("/reset/random_number", checkToken, resetRandomNumber);

export default router;
