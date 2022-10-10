import OrderController from "./src/controllers/order/order-controller";
import ProductController from "./src/controllers/product/product-controller";
import ShipmentController from "./src/controllers/shipment/shipment-controller";
import OnboardController from "./src/controllers/store/onboard-controller";
import { failure, success } from "./src/utils/http-response";

/**
 * Receives API credentials via webhook
 * @param {Event} event
 */
export const onboardStore = async (event) => {
  const controller = new OnboardController(event);
  const store = await controller.processStoreOnboarded();
  if (controller.isError()) {
    return failure(controller.getError());
  } else {
    return success(store);
  }
};

/**
 * Handles Order-related events via webhook
 * @param {Event} event
 */
export const handleOrder = async (event) => {
  const controller = new OrderController(event);
  const orders = await controller.processOrder();
  if (controller.isError()) {
    return failure(controller.getError());
  } else {
    return success(orders);
  }
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
