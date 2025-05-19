import { Router } from 'express';
import { create, editPassword, remove } from '../../controllers/user.controller';

const router = Router();

router.post('', create);

router.put('/password/:user_id', editPassword);

router.delete('/:user_id', remove);

export default router;