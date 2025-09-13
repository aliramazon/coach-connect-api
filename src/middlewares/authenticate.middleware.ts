import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

export const authenticate = catchAsync(async (req, res, next) => {
    const authToken = req.cookies.authToken;

    if (!authToken) {
        throw CustomError.authenticationFailed();
    }

    try {
        const decoded = jwt.verify(
            authToken,
            process.env.JWT_SECRET as Secret,
        ) as JwtPayload;

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        throw CustomError.authenticationFailed('Invalid credentials');
    }
});
