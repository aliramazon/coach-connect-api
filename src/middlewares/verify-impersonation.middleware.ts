import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

export const verifyImpersonation = catchAsync((req, res, next) => {
    const { user } = req;
    let effectiveUser = user;

    if (user?.role === UserRole.ADMIN) {
        const token = req.cookies.impersonationToken;

        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET as Secret,
                ) as JwtPayload;

                if (decoded.id && decoded.role) {
                    req.impersonatedUser = {
                        id: decoded.id,
                        role: decoded.role,
                    };
                    effectiveUser = req.impersonatedUser;
                }
            } catch {
                throw CustomError.authenticationFailed();
            }
        }
    }

    if (!effectiveUser) {
        throw CustomError.authenticationFailed();
    }
    req.effectiveUser = effectiveUser;
    return next();
});
