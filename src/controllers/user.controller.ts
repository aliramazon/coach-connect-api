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
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        csrfToken,
    });
});

const loginAs = catchAsync(async (req, res) => {
    const { userId }: { userId: string } = req.body;
    if (!userId) {
        throw CustomError.badRequest('Missing userId');
    }
    const authToken = await userService.loginAs(userId);

    res.cookie('loginAsAuthToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
    });
});

export const getMe = catchAsync(async (req, res) => {
    const { user, loginAs } = req;

    const effectiveUser = loginAs ?? user!;

    const userData = await userService.getMe(effectiveUser.id);

    res.status(200).json({
        success: true,
        data: userData,
    });
});

export const getAll = catchAsync(async (req, res) => {
    const users = await userService.getAll();

    res.status(200).json({
        success: true,
        data: users,
    });
});

export const userController = {
    login,
    loginAs,
    getMe,
    getAll,
};
