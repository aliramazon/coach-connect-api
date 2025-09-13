import jwt from 'jsonwebtoken';
import { UserRole, UserStatus } from '../generated/prisma';
import { Prisma } from '../generated/prisma/client';
import { prisma } from '../prisma';
import { bcryptUtil } from '../utils/bcrypt';
import { cryptoUtil } from '../utils/crypto';
import { CustomError } from '../utils/custom-error';

const create = async (data: Prisma.UserCreateInput) => {
    const inviteToken = cryptoUtil.createToken();
    const hashedInviteToken = cryptoUtil.hash(inviteToken);
    const createdUser = await prisma.user.create({
        data: {
            ...data,
            inviteToken: hashedInviteToken,
            email: data.email.toLowerCase(),
        },
        omit: {
            password: true,
            inviteToken: true,
        },
    });
    // Adding original inviteToken. We need it when we send password creation invite
    return { createdUser, inviteToken };
};

const createPassword = async (
    inviteToken: string,
    password: string,
    email: string,
) => {
    const hashedInviteToken = cryptoUtil.hash(inviteToken);
    const hashedPassword = await bcryptUtil.hash(password);

    const user = await prisma.user.findFirst({
        where: { inviteToken: hashedInviteToken },
    });

    if (!user) throw CustomError.authenticationFailed();
    if (user.email !== email) {
        throw CustomError.notFound('User not found');
    }

    await prisma.user.update({
        where: {
            email,
        },

        data: {
            password: hashedPassword,
            status: UserStatus.ACTIVE,
            inviteToken: null,
            joinDate: new Date(),
        },
    });
};

const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) throw CustomError.authenticationFailed();
    if (user.status === UserStatus.INACTIVE) {
        throw CustomError.badRequest('Inactive Account');
    }

    if (user.password) {
        const isPasswordMatches = await bcryptUtil.compare(
            password,
            user.password,
        );
        if (!isPasswordMatches) {
            throw CustomError.authenticationFailed();
        }
    }

    const authToken = jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: '2 days' },
    );

    const csrfToken = cryptoUtil.createToken();

    return { authToken, csrfToken };
};

export const getOne = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        omit: {
            password: true,
            inviteToken: true,
        },
    });

    if (!user) {
        throw CustomError.notFound('User not found');
    }

    return user;
};

export const impersonate = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        omit: {
            inviteToken: true,
            password: true,
        },
    });

    if (!user) {
        throw CustomError.notFound('User not found');
    }

    const authToken = jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: '2 days' },
    );

    return authToken;
};

export const getAll = async () => {
    const users = await prisma.user.findMany({
        where: {
            NOT: {
                role: UserRole.ADMIN,
            },
        },
        omit: {
            password: true,
            inviteToken: true,
        },
    });

    return users;
};
export const userService = {
    createPassword,
    create,
    login,
    impersonate,
    getOne,
    getAll,
};
