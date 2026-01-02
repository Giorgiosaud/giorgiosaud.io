/**
 * Application-wide constants for consistent configuration.
 */

/** Number of notes displayed per page in paginated views */
export const PAGINATION_SIZE = 6

/** Minimum character length for contact form messages */
export const MESSAGE_MIN_LENGTH = 10

/** Maximum character length for contact form messages */
export const MESSAGE_MAX_LENGTH = 500

/** Length of self-healing URL codes (consonants only, no dashes) */
export const SELF_HEALING_CODE_LENGTH = 6

/** Regex pattern for validating self-healing codes */
export const SELF_HEALING_REGEX = /^[^aeiouAEIOU-]{6}$/
