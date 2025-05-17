import { Router } from 'express';
import { generateTokenAndSendEmail, create, editPassword } from '../../controllers/user.controller';

const router = Router();

router.get('/token', generateTokenAndSendEmail);

router.post('', create);

router.put('/:user_id', editPassword);

export default router;