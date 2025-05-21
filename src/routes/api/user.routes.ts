import { Router } from 'express';
import { getById, getIsConfirmedEmailById, create, editPassword, removeToken, editToken, remove, editConfirmEmail } from '../../controllers/user.controller';

const router = Router();

router.get('/:user_id', getById);
router.get('/confirm_email/:user_id', getIsConfirmedEmailById);

router.post('', create);

router.patch('/token/:user_id', editToken);
router.patch('/token/reset/:user_id', removeToken);
router.patch('/confirm_email/:user_id', editConfirmEmail);
router.patch('/password/:user_id', editPassword);

router.delete('/:user_id', remove);

export default router;