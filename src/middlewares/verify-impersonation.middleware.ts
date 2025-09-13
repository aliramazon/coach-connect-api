import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

export const verifyImpersonation = catchAsync((req, res, next) => {
    const { user } = req;

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
                }
            } catch {
                throw CustomError.authenticationFailed();
            }
        }
    }

    return next();
});
