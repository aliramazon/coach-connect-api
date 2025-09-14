import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

export const verifyCSRF = catchAsync(async (req, _, next) => {
    const csrfCookie = req.cookies.csrfToken;
    const csrfHeader = req.headers['x-csrf-token'] as string;

    if (!csrfCookie) {
        throw CustomError.authenticationFailed(
            'Session expired, please login again',
        );
    }

    if (!csrfHeader || csrfCookie !== csrfHeader) {
        throw CustomError.forbidden('Invalid request');
    }

    next();
});
