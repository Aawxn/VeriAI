import { SupportedPlatform } from '../types';
/**
 * Utility functions shared across the extension
 */
/**
 * Detect which AI platform the current URL belongs to
 */
export declare function detectPlatform(url: string): SupportedPlatform;
/**
 * Generate unique ID for responses and feedback
 */
export declare function generateId(): string;
/**
 * Debounce function for performance optimization
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function for rate limiting
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Safe JSON parsing with fallback
 */
export declare function safeJsonParse<T>(json: string, fallback: T): T;
/**
 * Sanitize text content to prevent XSS
 */
export declare function sanitizeText(text: string): string;
/**
 * Calculate confidence score based on multiple factors
 */
export declare function calculateConfidence(factors: number[]): number;
/**
 * Format timestamp for display
 */
export declare function formatTimestamp(date: Date): string;
/**
 * Check if element is visible in viewport
 */
export declare function isElementVisible(element: Element): boolean;
/**
 * Wait for element to appear in DOM
 */
export declare function waitForElement(selector: string, timeout?: number): Promise<Element | null>;
//# sourceMappingURL=utils.d.ts.map