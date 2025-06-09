// utilities/crypto.ts

import crypto from 'crypto';

const createKeyFromSecret = (secretKey: string): Buffer =>
    // Create a 32-byte key via SHA-256
    crypto.createHash('sha256')
        .update(secretKey)
        .digest();

const algorithm = 'aes-256-ctr';
const secretKey = process.env.PAYLOAD_SECRET || 'fallback-key';
// Ensure PAYLOAD_SECRET is set in your environment for production

export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        algorithm,
        createKeyFromSecret(secretKey),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(text),
        cipher.final()
    ]);

    // Prepend IV (in hex) so we can easily retrieve it on decrypt
    return iv.toString('hex') + encrypted.toString('hex');
};

export const decrypt = (hash: string): string => {
    // IV is the first 32 hex characters (16 bytes),
    // the rest is the encrypted content
    const ivString = hash.slice(0, 32);
    const contentString = hash.slice(32);

    const iv = Buffer.from(ivString, 'hex');
    const encryptedContent = Buffer.from(contentString, 'hex');

    const decipher = crypto.createDecipheriv(
        algorithm,
        createKeyFromSecret(secretKey),
        iv
    );

    const decrypted = Buffer.concat([
        decipher.update(encryptedContent),
        decipher.final()
    ]);

    return decrypted.toString();
};
