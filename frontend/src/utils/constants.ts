export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'OpenLog';
export const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Pagination defaults
export const ITEMS_PER_PAGE = 10;
export const MAX_ITEMS_PER_PAGE = 100;

// Query stale times
export const STALE_TIME_SHORT = 1 * 60 * 1000; // 1 minute
export const STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Activity chart
export const ACTIVITY_DAYS = 7;

// Image upload
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'Unauthorized. Please log in.',
  IMAGE_TOO_LARGE: `Image must be less than ${MAX_IMAGE_SIZE_MB}MB`,
  INVALID_IMAGE_TYPE: 'Only JPEG, PNG, GIF, and WebP images are supported',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ENTRY_FILTERS: 'openlog_entry_filters',
  THEME: 'openlog_theme',
} as const;
