import bcryptjs from 'bcryptjs';

class Bcrypt {
    private readonly rounds = 12;

    async hash(password: string): Promise<string> {
        return bcryptjs.hash(password, await bcryptjs.genSalt(this.rounds));
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcryptjs.compare(password, hash);
    }
}

export const bcrypt = new Bcrypt();
