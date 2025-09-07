import { faker } from '@faker-js/faker';
import { config } from 'dotenv';

import { UserRole } from '../../generated/prisma';
import { userService } from '../../services/user.service';
config();

const generateRandomUserInfo = (role: UserRole) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        email: faker.internet.email({
            firstName,
            lastName,
            provider: 'gmail.com',
        }),
        phoneNumber: faker.phone.number({
            style: 'national',
        }),
        role: role,
        firstName,
        lastName,
    };
};

const generateUsers = () => {
    const users = [];

    users.push(generateRandomUserInfo(UserRole.ADMIN));

    for (let i = 1; i <= 15; i++) {
        users.push(
            generateRandomUserInfo(i <= 10 ? UserRole.STUDENT : UserRole.COACH),
        );
    }

    return users;
};

const seedUsers = async () => {
    const users = generateUsers();

    const data = await Promise.all(
        users.map((user) => userService.create(user)),
    );

    await Promise.all(
        data.map(({ createdUser, inviteToken }) =>
            userService.createPassword(
                inviteToken,
                `${createdUser.firstName}${createdUser.lastName}`,
                createdUser.email,
            ),
        ),
    );
};

seedUsers();
