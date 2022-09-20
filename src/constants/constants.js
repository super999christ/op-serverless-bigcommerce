/**
 * Currently we only handle json, and the rest will response as text/plain
 * TODO: should handle more content types
 */
export const DEFAULT_RESPONSE_TYPE = 'application/json';

/**
 * PostgreSQL Environment Variables
 */
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;