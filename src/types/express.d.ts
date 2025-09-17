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
                role: UserRole;
            };
            effectiveUser?: {
                id: string;
                role: UserRole;
            };
        }
    }
}
