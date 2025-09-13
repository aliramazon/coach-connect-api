import { UserRole } from '../generated/prisma';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: UserRole;
            };
            loginAs?: {
                id: string;
                role: Omit<UserRole, 'ADMIN'>;
            };
        }
    }
}
