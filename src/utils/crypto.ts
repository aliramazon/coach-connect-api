import crypto from 'crypto';

class Crypto {
    private generateRandomString = (length = 32): string => {
        return crypto
            .randomBytes(length)
            .toString('base64url') // Node v15+ supports base64url
            .slice(0, length);
    };

    hash = (input: string): string => {
        return crypto.createHash('sha256').update(input).digest('hex');
    };

    createToken = (): string => {
        const randomString = this.generateRandomString();
        return this.hash(randomString);
    };

    compare(token: string, hashedToken: string): boolean {
        return hashedToken === this.hash(token);
    }
}

export const cryptoUtil = new Crypto();
