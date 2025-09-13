import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { UserRole } from '../generated/prisma';
import { authenticate } from '../middlewares/authenticate.middleware';
import { requireRole } from '../middlewares/require-role.middleware';

const userRouter = Router();

userRouter.post('/login', userController.login);
userRouter.post(
    '/:id/impersonate',
    authenticate,
    requireRole([UserRole.ADMIN]),
    userController.impersonate,
);
userRouter.get(
    '/',
    authenticate,

    userController.getAll,
);
userRouter.get(
    '/:id',
    authenticate,
    requireRole([UserRole.ADMIN]),
    userController.getOne,
);
userRouter.get('/me', authenticate, userController.getOne);

export { userRouter };
