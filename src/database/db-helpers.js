// External dependencies
import bcrypt from "bcryptjs";

// Internal dependencies
import { ERROR_DB_FAILED, ERROR_DB_NOT_FOUND } from "../constants/errors";
import { executeQuery } from "./db-connection";

/**
 * Adds a new store to DB
 * @returns Promise<Store>
 */
const addStore = (
  storeId,
  merchantId,
  storeName,
  revSharePercent,
  variantId,
  priceTierId,
  apiPath,
  clientId,
  clientSecret,
  accessToken
) => {
  const query = `
  INSERT INTO stores (store_id, merchant_id, store_name, revenue_share, variant_id, price_tier_id, api_path, client_id, client_secret, access_token)
  VALUES
    (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
  RETURNING *;
  `;
  return executeQuery(query, [
    storeId,
    merchantId,
    storeName,
    revSharePercent,
    variantId,
    priceTierId,
    apiPath,
    clientId,
    clientSecret,
    accessToken,
  ]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Adds a new user to DB
 * @returns Promise<User>
 */
const addUser = (firstName, lastName, email, password, type) => {
  // Calculate hashed password
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);

  const query = `
  INSERT INTO users (first_name, last_name, email, password, type)
  VALUES
    (
      $1, $2, $3, $4, $5
    )
  RETURNING *;
  `;
  return executeQuery(query, [
    firstName,
    lastName,
    email,
    hashedPassword,
    type,
  ]).then((res) => {
    console.log("@User DB Result: ", res);
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Adds a new merchant to DB
 * @returns Promise<Merchant>
 */
const addMerchant = (userId, billingEmail, supportEmail) => {
  const query = `
  INSERT INTO merchants (user_id, billing_email, support_email)
  VALUES
    (
      $1, $2, $3
    )
  RETURNING *;
  `;
  return executeQuery(query, [userId, billingEmail, supportEmail]).then(
    (res) => {
      if (res.rowCount) {
        return res.rows[0];
      } else {
        throw Error(ERROR_DB_FAILED);
      }
    }
  );
};

/**
 * Adds a new store setting to DB
 * @returns Promise<StoreSetting>
 */
const addStoreSetting = (storeUrl) => {
  const query = `
  INSERT INTO store_settings (store_url)
  VALUES
    (
      $1
    )
  RETURNING *;
  `;
  return executeQuery(query, [storeUrl]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Looks up priceTierId by price
 * @returns Promise<id>
 */
const getPriceTierIdByPrice = (price) => {
  const query = `
  SELECT id FROM price_tiers WHERE insurance_cost = $1;
  `;
  return executeQuery(query, [price * 100]).then((res) => {
    if (res.rowCount) {
      return res.rows[0].id;
    } else {
      throw Error(ERROR_DB_NOT_FOUND);
    }
  });
};

/**
 * Looks up store by id
 * @returns Promise<Store>
 */
const getStoreById = (storeId) => {
  const query = `
  SELECT * FROM stores WHERE store_id = $1;
  `;
  return executeQuery(query, [storeId]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      return null;
    }
  });
};

/**
 * Adds a new order to the DB
 */
const addOrder = (
  customerName,
  orderDate,
  shippingAddress,
  shippingCourier,
  phoneNumber,
  orderTotal,
  orderShipping,
  orderId,
  orderEmail,
  postalCode,
  storeId,
  orderJson,
  billingAddress,
  billingPhoneNumber,
  billingName,
  ignorePayout = false
) => {
  const query = `
  INSERT INTO orders (customer_name, order_date, shipping_address, shipping_courier, phone_number, order_total, order_shipping, order_id, order_email, postal_code, store_id, order_json, billing_address, billing_phone_number, billing_name, ignore_payout)
  VALUES
    (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    )
  RETURNING *;`;
  return executeQuery(query, [
    customerName,
    orderDate,
    shippingAddress,
    shippingCourier,
    phoneNumber,
    orderTotal,
    orderShipping,
    orderId,
    orderEmail,
    postalCode,
    storeId,
    orderJson,
    billingAddress,
    billingPhoneNumber,
    billingName,
    ignorePayout,
  ]).then((res) => {
    console.log("@DB Add Order: ", res);
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Adds a new order insurance to DB
 */
const addOrderInsurance = (
  insuranceCost,
  insuranceDiscount,
  orderId,
  originalInsurance
) => {
  const query = `
  INSERT INTO order_insurance (insurance_cost, insurance_discount, order_id, original_insurance)
  VALUES ($1, $2, $3, $4)
  RETURNING *;`;
  return executeQuery(query, [
    insuranceCost,
    insuranceDiscount,
    orderId,
    originalInsurance,
  ]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Adds a new order item to DB
 */
const addOrderItem = (orderId, itemId, lineItemId, quantity, discount) => {
  const query = `
  INSERT INTO order_items (order_id, item_id, line_item_id, quantity, discount)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;`;
  return executeQuery(query, [
    orderId,
    itemId,
    lineItemId,
    quantity,
    discount,
  ]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Gets list of available currencies
 */
const getCurrencies = () => {
  const query = `
  SELECT currency FROM currencies`;
  return executeQuery(query, []).then((res) => {
    return res.rows;
  });
};

/**
 * Gets exchange rate of specific date and currency
 */
const getTodayRate = (date, currency) => {
  const query = `
  SELECT * FROM exchange_rates
  WHERE date = $1 and convert_to = $2`;
  return executeQuery(query, [date, currency]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      return null;
    }
  });
};

/**
 * Adds a new product variant to DB
 */
const addItem = (variantId, productId, storeId, itemName, photo, price) => {
  const query = `
  INSERT INTO items (variant_id, product_id, store_id, item_name, photo, price)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;`;
  return executeQuery(query, [
    variantId,
    productId,
    storeId,
    itemName,
    photo,
    price,
  ]).then((res) => {
    if (res.rowCount) {
      return res.rows[0];
    } else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Removes product by id
 */
const removeItem = (id) => {
  const query = `
  DELETE FROM items
  WHERE id=$1
  `;
  return executeQuery(query, [id]).then((res) => {});
};

/**
 * Gets an item by storeId and variantId
 */
const getItemByStoreVariantId = (storeId, variantId) => {
  const query = `SELECT * FROM items
  WHERE store_id = $1 AND variant_id = $2`;
  return executeQuery(query, [storeId, variantId]).then((res) => {
    if (res.rowCount) return res.rows[0];
    else return null;
  });
};

/**
 * Removes items by storeId and productId
 */
const removeItemsByStoreProductId = (storeId, productId) => {
  const query = `
  DELETE FROM items
  WHERE store_id = $1 AND product_id = $2`;
  return executeQuery(query, [storeId, productId]).then((res) => {
    console.log("Items deleted successfully...");
  });
};

/**
 * Removes items by storeId and variantId
 */
 const removeItemsByStoreVariantId = (storeId, variantId) => {
  const query = `
  DELETE FROM items
  WHERE store_id = $1 AND variant_id = $2`;
  return executeQuery(query, [storeId, variantId]).then((res) => {
    console.log("Items deleted successfully...");
  });
};

/**
 * Gets an order by orderId
 */
const getOrdersByOrderId = (orderId) => {
  const query = `
  SELECT * FROM orders
  WHERE order_id = $1`;
  return executeQuery(query, [orderId])
    .then((res) => {
      return res.rows;
    });
};

/**
 * Adds a new order fulfillment to DB
 */
const addFulfillment = (
  quantity,
  trackingCompany,
  trackingNumber,
  trackingUrl,
  lineItemId,
  productId,
  storeId,
  orderId
) => {
  const query = `
  INSERT INTO fulfillments (quantity, tracking_company, tracking_number, tracking_url, line_item_id, product_id, store_id, order_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;`;
  return executeQuery(query, [
    quantity,
    trackingCompany,
    trackingNumber,
    trackingUrl,
    lineItemId,
    productId,
    storeId,
    orderId,
  ]).then((res) => {
    if (res.rowCount) return res.rows[0];
    else {
      throw Error(ERROR_DB_FAILED);
    }
  });
};

/**
 * Removes all fulfillments by orderId
 */
const removeFulfillmentsByOrderId = (orderId) => {
  const query = `
  DELETE FROM fulfillments
  WHERE order_id = $1`;
  return executeQuery(query, [orderId]).then((res) => {});
};

export {
  addStore,
  addUser,
  addMerchant,
  addStoreSetting,
  getPriceTierIdByPrice,
  getStoreById,
  addOrder,
  addOrderInsurance,
  addOrderItem,
  getCurrencies,
  getTodayRate,
  addItem,
  removeItem,
  getItemByStoreVariantId,
  getOrdersByOrderId,
  addFulfillment,
  removeFulfillmentsByOrderId,
  removeItemsByStoreProductId,
  removeItemsByStoreVariantId
};
