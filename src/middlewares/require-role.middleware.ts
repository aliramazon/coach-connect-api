import { UserRole } from '../generated/prisma';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

export const requireRole = (allowedRoles: UserRole[]) => {
    return catchAsync(async (req, res, next) => {
        if (req.user && !allowedRoles.includes(req.user.role)) {
            throw CustomError.forbidden('Insufficient permissions');
        }
        next();
    });
};
