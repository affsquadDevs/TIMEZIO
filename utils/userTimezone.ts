/**
 * Utilities for managing user's timezone in localStorage
 */

const STORAGE_KEY = 'timezio_user_timezone';

/**
 * Get user's saved timezone from localStorage
 */
export function getUserTimezone(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Save user's timezone to localStorage
 */
export function saveUserTimezone(timezone: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, timezone);
  } catch (error) {
    console.error('Failed to save user timezone:', error);
  }
}

/**
 * Clear user's saved timezone from localStorage
 */
export function clearUserTimezone(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear user timezone:', error);
  }
}

/**
 * Get user's current timezone (from browser or saved)
 */
export function getCurrentUserTimezone(): string {
  if (typeof window === 'undefined') return 'UTC';
  
  // Try saved timezone first
  const saved = getUserTimezone();
  if (saved) return saved;
  
  // Fallback to browser's timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

