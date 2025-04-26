// Utility functions for safely working with localStorage in a Next.js environment

/**
 * Safely get an item from localStorage
 * @param key The key to get from localStorage
 * @returns The value from localStorage, or null if not found or error
 */
export const getItem = (key: string): any => {
  try {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Safely set an item in localStorage
 * @param key The key to set in localStorage
 * @param value The value to set
 * @returns true if successful, false if error
 */
export const setItem = (key: string, value: any): boolean => {
  try {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Safely remove an item from localStorage
 * @param key The key to remove from localStorage
 * @returns true if successful, false if error
 */
export const removeItem = (key: string): boolean => {
  try {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
    return false;
  }
};

/**
 * Safely clear all items from localStorage
 * @returns true if successful, false if error
 */
export const clearAll = (): boolean => {
  try {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      localStorage.clear();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};
