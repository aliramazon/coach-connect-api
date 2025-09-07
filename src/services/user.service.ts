import jwt from 'jsonwebtoken';
import { Prisma } from '../generated/prisma/client';
import { UserStatus } from '../generated/prisma/enums';
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

    if (!user) throw CustomError.unauthorized('INVALID_TOKEN');
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

export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) throw CustomError.unauthorized('Wrong credentionals');
    if (user.status === UserStatus.INACTIVE) {
        throw CustomError.badRequest('Inactive Account');
    }

    if (user.password) {
        const isPasswordMatches = await bcryptUtil.compare(
            password,
            user.password,
        );
        if (!isPasswordMatches) {
            throw CustomError.unauthorized('Wrong credentionals');
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

export const userService = {
    createPassword,
    create,
};
