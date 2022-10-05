import OrderController from "./src/controllers/order/order-controller";
import ProductController from "./src/controllers/product/product-controller";
import ShipmentController from "./src/controllers/shipment/shipment-controller";
import OnboardController from "./src/controllers/store/onboard-controller";
import { failure, success } from "./src/utils/http-response";
import { ERROR_GN_ONBOARD_FAILED } from "./src/constants/errors";
// import BigCommerceWebhook from "./src/bigcommerce/bc-webhook";
import BigCommerceAPI from "./src/bigcommerce/bc-api";
import { addMerchant, addStore, addStoreSetting, addUser, getPriceTierIdByPrice } from "./src/database/db-helpers";
import { UserType } from "./src/constants/constants";

/**
 * Receives API credentials via webhook
 * @param {Event} event
 */
export const onboardStore = async (event) => {
  const controller = new OnboardController(event);
  // const webhookService = new BigCommerceWebhook(
  //   controller.apiPath,
  //   controller.accessToken
  // );
  const apiService = new BigCommerceAPI(
    controller.apiPath,
    controller.accessToken
  );

  try {
    // Setup Order|Product|Shipment-related webhooks
    // await webhookService.setupOrderWebhook();
    // await webhookService.setupProductWebhook();
    // await webhookService.setupShipmentWebhook();

    // Create an OP product
    const product = await apiService.createOPProduct();
    // Find variantID
    const variant = product.variants.find(
      (item) => item.price === controller.opFee
    );
    // Find PriceTierId
    const priceTierId = await getPriceTierIdByPrice(controller.opFee);

    console.log("@Variant: ", variant);
    console.log("@PriceTierId: ", priceTierId);

    // Get Store metadata
    const storeMetadata = await apiService.getStoreMetadata();

    console.log("@StoreMetadata: ", storeMetadata);

    // Create a user
    const user = await addUser(
      controller.firstName,
      controller.lastName,
      controller.email,
      controller.password,
      UserType.MERCHANT
    );

    console.log("@User: ", user);

    // Create a merchant
    const merchant = await addMerchant(
      user["id"],
      controller.billingEmail,
      controller.supportEmail
    );

    console.log("@Merchant: ", merchant);

    // Create a store
    const store = await addStore(
      merchant["id"],
      storeMetadata.name,
      controller.revSharePercent,
      variant.id,
      priceTierId,
      controller.apiPath,
      controller.clientId,
      controller.clientSecret,
      controller.accessToken
    );

    console.log("@Store: ", store);

    // Create a storeSetting
    const storeSetting = await addStoreSetting(storeMetadata.control_panel_base_url);

    console.log("@StoreSetting: ", storeSetting);
    return success(store);
  } catch (err) {
    console.log("#Onboarding Error: ", err);
    return failure({ message: ERROR_GN_ONBOARD_FAILED });
  }
};

/**
 * Handles Order-related events via webhook
 * @param {Event} event
 */
export const handleOrder = async (event) => {
  const controller = new OrderController(event);
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
