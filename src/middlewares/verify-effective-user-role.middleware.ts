import { UserRole } from '../generated/prisma';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

export const verifyEffectiveUserRole = (allowedRoles: UserRole[]) => {
    return catchAsync(async (req, res, next) => {
        const { effectiveUser } = req;
        if (effectiveUser && !allowedRoles.includes(effectiveUser?.role)) {
            throw CustomError.forbidden();
        }
        next();
    });
};
