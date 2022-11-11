/**
 * Currently we only handle json, and the rest will response as text/plain
 * TODO: should handle more content types
 */
export const DEFAULT_RESPONSE_TYPE = "application/json";

/**
 * Base URL of Lambda functions
 */
export const BASE_LAMBDA_URL = process.env.API_GATEWAY_URL;

/**
 * Base URL of BigCommerce API
 */
export const BASE_BC_URL = `https://api.bigcommerce.com`;

/**
 * User Types
 */
export const UserType = {
  ADMIN: 'admin',
  CONCIERGE: 'concierge',
  MERCHANT: 'merchant'
};

/**
 * Variant Prices
 */
export const variantPrices = [
  0.98, 1, 1.15, 1.35, 1.55, 1.75, 1.95, 2, 2.15, 2.35, 2.55, 2.75, 2.95, 3,
  3.15, 3.35, 3.55, 3.75, 3.95, 4, 4.15, 4.35, 4.55, 4.75, 4.95, 5, 5.15, 5.35,
  5.55, 5.75, 5.95, 6, 6.15, 6.35, 6.55, 6.75, 6.95, 7, 7.15, 7.35, 7.55, 7.75,
  7.95, 8, 8.15, 8.35, 8.55, 8.75, 8.95, 9, 9.15, 9.35, 9.55, 9.75, 9.95, 10,
  10.15, 10.35, 10.55, 10.75, 10.95, 11, 11.15, 11.35, 11.55, 11.75, 11.95, 12,
  12.15, 12.35, 12.55, 12.75, 12.95, 13, 15, 15.15, 15.35, 15.55, 15.75, 15.95,
  16, 17, 17.15, 17.35, 17.55, 17.75, 17.95, 18, 19, 19.15, 19.35, 19.55, 19.75,
  19.95, 20, 25, 30, 35, 65, 75,
];

/**
 * Webhook Order Event Types
 */
export const EVENT_ORDER_CREATED = "order/created";
export const EVENT_ORDER_UPDATED = "order/updated";
export const EVENT_PRODUCT_CREATED = "product/created";
export const EVENT_PRODUCT_UPDATED = "product/updated";

/**
 * PostgreSQL Environment Variables
 */
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;

/**
 * OrderProtection Variables
 */
export const OP_PRODUCT_NAME = "Order Protection";

/**
 * BigCommerce Platform Variables
 */
export const BC_PLATFORM_ID = 1;

/**
 * OrderStatus Variables
 */
export const ORDER_STATUS_SHIPPED = 2;