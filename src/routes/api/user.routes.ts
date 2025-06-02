import { Router } from "express";
import {
	getById,
	create,
	changePassword,
} from "../../controllers/user.controller";
import {
	checkEmailExists,
	checkUserExists,
} from "../../middlewares/user.middleware";
import { returnToken } from "../../controllers/authorization.controller";
import { checkAuthorization } from "../../middlewares/authorization.middleware";

const router = Router();

router.get("/:user_id", getById);

router.post("", checkUserExists, create);
router.post("/email", checkEmailExists, returnToken);

router.patch("/change_password", checkAuthorization, changePassword);
export default router;
