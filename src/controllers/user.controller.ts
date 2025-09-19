import { User } from '../generated/prisma';
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

    const { authToken, csrfToken, user } = await userService.login(
        email,
        password,
    );

    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        csrfToken,
        data: {
            user,
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
    const { authToken, user } = await userService.impersonate(id);

    res.cookie('impersonationToken', authToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Impersonation successful',
        data: {
            user,
        },
    });
});

const stopImpersonation = catchAsync(async (req, res) => {
    res.clearCookie('impersonationToken');

    res.status(200).json({
        success: true,
        message: 'Impersonation stopped successfully',
    });
});

export const getOne = catchAsync(async (req, res) => {
    const { effectiveUser, impersonatedUser, user } = req;

    const effectiveUserData = await userService.getOne(effectiveUser!.id);

    let adminUser;
    if (impersonatedUser) {
        adminUser = await userService.getOne(user!.id);
    }

    const data: {
        impersonatedUser?: Omit<User, 'inviteToken' | 'password'>;
        user?: Omit<User, 'inviteToken' | 'password'>;
    } = {};

    if (impersonatedUser) {
        data.impersonatedUser = effectiveUserData;
        data.user = adminUser;
    } else {
        data.user = effectiveUserData;
    }

    res.status(200).json({
        success: true,
        data: data,
        csrfToken: req.cookies.csrfToken,
        isImpersonating: impersonatedUser ? true : false,
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
    stopImpersonation,
};
