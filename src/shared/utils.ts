import { PLATFORMS, PLATFORM_URLS } from './constants';
import { SupportedPlatform } from '../types';

/**
 * Utility functions shared across the extension
 */

/**
 * Detect which AI platform the current URL belongs to
 */
export function detectPlatform(url: string): SupportedPlatform {
  try {
    const hostname = new URL(url).hostname;
    console.log('🔍 Detecting platform for:', hostname);
    
    for (const [platform, urls] of Object.entries(PLATFORM_URLS)) {
      if (urls.some(platformUrl => hostname.includes(platformUrl))) {
        console.log('✓ Platform matched:', platform);
        return platform as SupportedPlatform;
      }
    }
    
    console.log('⚠ No specific platform detected, using generic');
    return PLATFORMS.GENERIC;
  } catch (error) {
    console.error('✗ Error detecting platform:', error);
    return PLATFORMS.GENERIC;
  }
}

/**
 * Generate unique ID for responses and feedback
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Safe JSON parsing with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Sanitize text content to prevent XSS
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Calculate confidence score based on multiple factors
 */
export function calculateConfidence(factors: number[]): number {
  if (factors.length === 0) return 0;
  
  const average = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  return Math.max(0, Math.min(1, average));
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Wait for element to appear in DOM
 */
export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}