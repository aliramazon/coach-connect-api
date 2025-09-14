import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catch-async';
import { CustomError } from '../utils/custom-error';
import { isProd } from '../utils/env';

type LoginBody = {
    email?: string;
    password?: string;
};

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
        throw CustomError.badRequest('Email and password are required');
    }

    const { authToken, csrfToken, role } = await userService.login(
        email,
        password,
    );

    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        csrfToken,
        data: {
            role,
        },
    });
});

const logout = catchAsync(async (req, res) => {
    res.clearCookie('authToken');
    res.clearCookie('csrfToken');
    res.clearCookie('impersonationToken');

    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
});

const impersonate = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw CustomError.badRequest('Missing userId');
    }
    const authToken = await userService.impersonate(id);

    res.cookie('impersonationToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Impersonation successful',
    });
});

export const getOne = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const impersonationToken = req.cookies.impersonationToken;

    const targetUserId = id ?? user?.id;

    const userData = await userService.getOne(targetUserId);

    res.status(200).json({
        success: true,
        data: userData,
        csrfToken: req.cookies.csrfToken,
        isImpersonating: impersonationToken ? true : false,
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
    impersonate,
    getOne,
    getAll,
    logout,
};
