/**
 * Simple encryption utility for sensitive data
 * Uses Base64 encoding with a simple XOR cipher
 * Note: This is basic obfuscation, not military-grade encryption
 */

const ENCRYPTION_KEY = 'AI-ETHICS-MONITOR-2025'; // In production, use a proper key management system

/**
 * Encrypt a string
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    // XOR cipher with key
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    // Base64 encode
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback to plain text
  }
}

/**
 * Decrypt a string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    // Base64 decode
    const decoded = atob(encryptedText);
    
    // XOR decipher with key
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Fallback to encrypted text
  }
}

/**
 * Hash a string (one-way)
 */
export function hash(text: string): string {
  if (!text) return '';
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Securely clear sensitive data from memory
 */
export function secureClear(obj: any): void {
  if (typeof obj === 'string') {
    // Overwrite string in memory (best effort)
    obj = '\0'.repeat(obj.length);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        secureClear(obj[key]);
        delete obj[key];
      }
    }
  }
}
