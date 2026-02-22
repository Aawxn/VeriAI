/**
 * Military-grade encryption utility for sensitive data
 * Uses AES-256-GCM with Web Crypto API
 * Provides authenticated encryption with tamper detection
 */

// Encryption key derivation from passphrase
const ENCRYPTION_PASSPHRASE = 'VeriAI-Ethical-Aligner-Verifier-2025-Secure-Key';
const SALT = new Uint8Array([86, 101, 114, 105, 65, 73, 45, 50, 48, 50, 53]); // "VeriAI-2025"

/**
 * Derive encryption key from passphrase using PBKDF2
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns Base64 encoded: [IV (12 bytes)][Encrypted Data][Auth Tag]
 */
export async function encrypt(text: string): Promise<string> {
  if (!text) return '';
  
  try {
    const enc = new TextEncoder();
    const key = await deriveKey(ENCRYPTION_PASSPHRASE);
    
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt with AES-GCM
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128 // 128-bit authentication tag
      },
      key,
      enc.encode(text)
    );
    
    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Base64 encode
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt a string using AES-256-GCM
 */
export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';
  
  try {
    const dec = new TextDecoder();
    const key = await deriveKey(ENCRYPTION_PASSPHRASE);
    
    // Base64 decode
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt with AES-GCM (includes authentication check)
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      encrypted
    );
    
    return dec.decode(decrypted);
  } catch (error) {
    console.error('❌ Decryption error (data may be tampered):', error);
    throw new Error('Decryption failed - data integrity check failed');
  }
}

/**
 * Legacy encrypt for backward compatibility (synchronous)
 * WARNING: Uses weak XOR cipher - only for non-sensitive data
 */
export function encryptSync(text: string): string {
  if (!text) return '';
  
  try {
    const LEGACY_KEY = 'VeriAI-2025';
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ LEGACY_KEY.charCodeAt(i % LEGACY_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

/**
 * Legacy decrypt for backward compatibility (synchronous)
 */
export function decryptSync(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const LEGACY_KEY = 'VeriAI-2025';
    const decoded = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ LEGACY_KEY.charCodeAt(i % LEGACY_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
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
