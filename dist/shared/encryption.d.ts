/**
 * Simple encryption utility for sensitive data
 * Uses Base64 encoding with a simple XOR cipher
 * Note: This is basic obfuscation, not military-grade encryption
 */
/**
 * Encrypt a string
 */
export declare function encrypt(text: string): string;
/**
 * Decrypt a string
 */
export declare function decrypt(encryptedText: string): string;
/**
 * Hash a string (one-way)
 */
export declare function hash(text: string): string;
/**
 * Securely clear sensitive data from memory
 */
export declare function secureClear(obj: any): void;
//# sourceMappingURL=encryption.d.ts.map