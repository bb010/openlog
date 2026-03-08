export const ERROR_CODES = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  ENTRY_NOT_FOUND: 'ENTRY_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_PROJECT: 'DUPLICATE_PROJECT',
  IMAGE_NOT_FOUND: 'IMAGE_NOT_FOUND',
  IMAGE_UPLOAD_ERROR: 'IMAGE_UPLOAD_ERROR',
  INVALID_IMAGE_TYPE: 'INVALID_IMAGE_TYPE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const;
