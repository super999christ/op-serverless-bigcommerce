import OrderController from "./src/controllers/order/order-controller";
import ProductController from "./src/controllers/product/product-controller";
import ShipmentController from "./src/controllers/shipment/shipment-controller";
import SecretController from "./src/controllers/secret/secret-controller";
import { failure, success } from "./src/utils/http-response";
import { establishConnection } from "./src/utils/auth-axios";
import { BASE_URL } from "./src/constants/constants";

/**
 * Receives API credentials via webhook
 * @param {Event} event
 */
export const receiveSecret = async (event) => {
  const controller = new SecretController(event);

  // APIPath looks like `https://api.bigcommerce.com/stores/j5cnro6lel/v3/`
  const axios = establishConnection(controller.apiPath, controller.accessToken);

  try {
    // Setup Order-related webhooks
    await axios.post('/hooks', {
        scope: 'store/order/*',
        destination: `${BASE_URL}/order/handle-order`,
        is_active: true,
        headers: {}
      });
    // Setup Product-related webhooks
    await axios.post('/hooks', {
        scope: 'store/product/*',
        destination: `${BASE_URL}/product/handle-product`,
        is_active: true,
        headers: {}
      });
    // Setup Shipment-related webhooks
    await axios.post('/hooks', {
        scope: 'store/shipment/*',
        destination: `${BASE_URL}/shipment/handle-shipment`,
        is_active: true,
        headers: {}
      });
  } catch(err) {
    console.log('Webhook Setup Error: ', err);
    return failure({ message: 'Webhook setup failed' });
  }

  return success(controller.getSecret());
};

/**
 * Handles Order-related events via webhook
 * @param {Event} event
 */
export const handleOrder = async (event) => {
  const controller = new OrderController(event);
  console.log("Order Details: ", controller.body);
  return success(controller.body);
};

/**
 * Handles Product-related events via webhook
 * @param {Event} event
 */
export const handleProduct = async (event) => {
  const controller = new ProductController(event);
  return success(controller.body);
};

/**
 * Handles Shipment-related events via webhook
 * @param {Event} event
 */
export const handleShipment = (event) => {
  const controller = new ShipmentController(event);
  return success(controller.body);
};