import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';

type LoginBody = {
    email?: string;
    password?: string;
};

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
        throw CustomError.badRequest('Email and password are required');
    }

    const { authToken, csrfToken } = await userService.login(email, password);

    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 60 * 60 * 1000,
    });

    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        csrfToken,
    });
});

export const userController = {
    login,
};
