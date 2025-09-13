import { UserRole } from '../generated/prisma';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: UserRole;
            };
            impersonatedUser?: {
                id: string;
                role: Omit<UserRole, 'ADMIN'>;
            };
        }
    }
}
