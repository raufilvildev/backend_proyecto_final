import { Router } from "express";
import {
	requestConfirmationByEmail,
	resetRandomNumber,
	checkRandomNumberInput,
  returnToken,
} from "../../controllers/authorization.controller";
import { checkToken } from "../../middlewares/authorization.middleware";
import { checkUserExists } from "../../middlewares/user.middleware";

const router = Router();

router.post("/email_confirmation/request/:type", checkToken, requestConfirmationByEmail);
router.post("/email_confirmation", checkToken, checkRandomNumberInput);
router.post("/check_email", checkUserExists(["email"], true), returnToken);

router.patch("/reset/random_number", resetRandomNumber);

export default router;
