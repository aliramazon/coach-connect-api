import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { UserRole } from '../generated/prisma';
import { authenticate } from '../middlewares/authenticate.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { loginAs } from '../services/user.service';

const userRouter = Router();

userRouter.post('/login', userController.login);
userRouter.post(
    '/login-as',
    authenticate,
    requireRole([UserRole.ADMIN]),
    userController.loginAs,
);
userRouter.get(
    '/',
    authenticate,
    requireRole([UserRole.ADMIN]),
    userController.getAll,
);
userRouter.get('/user', authenticate, loginAs, userController.getMe);
userRouter.get('/me', authenticate, userController.getMe);

export { userRouter };
