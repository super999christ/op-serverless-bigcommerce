// External dependencies
import bcrypt from 'bcryptjs';

// Internal dependencies
import { ERROR_DB_FAILED, ERROR_DB_NOT_FOUND } from "../constants/errors";
import { executeQuery } from "./db-connection";

/**
 * Adds a new store to DB
 * @returns Promise<Store>
 */
const addStore = (
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
  INSERT INTO stores (merchant_id, store_name, revenue_share, variant_id, price_tier_id, api_path, client_id, client_secret, access_token)
  VALUES
    (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )
  RETURNING *;
  `;
  return executeQuery(query, [
    merchantId,
    storeName,
    revSharePercent,
    variantId,
    priceTierId,
    apiPath,
    clientId,
    clientSecret,
    accessToken,
  ])
    .then((res) => {
      if (res.rowCount) {
        return res.rows[0];
      } else {
        throw Error(ERROR_DB_FAILED);
      }
    })
    .catch((err) => {
      throw err;
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
  return executeQuery(query, [firstName, lastName, email, hashedPassword, type])
    .then((res) => {
      console.log("@User DB Result: ", res);
      if (res.rowCount) {
        return res.rows[0];
      } else {
        throw Error(ERROR_DB_FAILED);
      }
    })
    .catch((err) => {
      throw err;
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
  return executeQuery(query, [userId, billingEmail, supportEmail])
    .then((res) => {
      if (res.rowCount) {
        return res.rows[0];
      } else {
        throw Error(ERROR_DB_FAILED);
      }
    })
    .catch((err) => {
      throw err;
    });
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
  return executeQuery(query, [storeUrl])
    .then((res) => {
      if (res.rowCount) {
        return res.rows[0];
      } else {
        throw Error(ERROR_DB_FAILED);
      }
    })
    .catch((err) => {
      throw err;
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
  return executeQuery(query, [price * 100])
    .then(res => {
      if (res.rowCount) {
        return res.rows[0].id;
      } else {
        throw Error(ERROR_DB_NOT_FOUND);
      }
    })
    .catch(err => {
      throw err;
    });
};

export {
  addStore,
  addUser,
  addMerchant,
  addStoreSetting,
  getPriceTierIdByPrice
};