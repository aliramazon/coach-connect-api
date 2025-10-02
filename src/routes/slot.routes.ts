import { Router } from 'express';
import { slotController } from '../controllers/slot.controller';
import { UserRole } from '../generated/prisma';
import { authenticate } from '../middlewares/authenticate.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { verifyCSRF } from '../middlewares/verify-csrf.middleware';
import { verifyEffectiveUserRole } from '../middlewares/verify-effective-user-role.middleware';
import { verifyImpersonation } from '../middlewares/verify-impersonation.middleware';

const slotRouter = Router();

export const crudSlotMiddlewares = [
    authenticate,
    verifyCSRF,
    requireRole([UserRole.ADMIN, UserRole.COACH]),
    verifyImpersonation,
    verifyEffectiveUserRole([UserRole.COACH]),
];

slotRouter.post('/', ...crudSlotMiddlewares, slotController.create);
slotRouter.get('/', ...crudSlotMiddlewares, slotController.getAll);

export { slotRouter };
