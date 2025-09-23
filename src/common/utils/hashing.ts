import * as crypto from 'crypto';

export function calculateHash(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
}