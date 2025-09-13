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
};
