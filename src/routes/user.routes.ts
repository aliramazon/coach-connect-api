import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { UserRole } from '../generated/prisma';
import { authenticate } from '../middlewares/authenticate.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { verifyCSRF } from '../middlewares/verify-csrf.middleware';

const userRouter = Router();

userRouter.post('/login', userController.login);
userRouter.post(
    '/:id/impersonate',
    authenticate,
    verifyCSRF,
    requireRole([UserRole.ADMIN]),
    userController.impersonate,
);
userRouter.get(
    '/',
    authenticate,
    verifyCSRF,
    requireRole([UserRole.ADMIN]),
    userController.getAll,
);
userRouter.get('/me', authenticate, userController.getOne);
userRouter.get(
    '/:id',
    authenticate,
    requireRole([UserRole.ADMIN]),
    userController.getOne,
);

export { userRouter };
