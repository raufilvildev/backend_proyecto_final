import { Router } from 'express';
import { generateTokenAndSendEmail, create, editPassword } from '../../controllers/user.controller';
import { deleteUser } from '../../models/user.model';

const router = Router();

router.post('', create);

router.put('/password/:user_id', editPassword);

router.delete('/:user_id', deleteUser);

export default router;