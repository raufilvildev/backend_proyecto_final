import { Router } from "express";
import {
	checkToken,
	requestConfirmationByEmail,
	resetRandomNumber,
	checkRandomNumberInput,
  login,
} from "../../controllers/authorization.controller";

const router = Router();

router.get("", checkToken);

router.post("/request/email_confirmation", requestConfirmationByEmail);
router.post("/email_confirmation", checkRandomNumberInput);
router.post("/login", login);
router.patch("/email_confirmation", resetRandomNumber);

export default router;
