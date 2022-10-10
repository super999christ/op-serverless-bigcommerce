import { establishConnection } from "../utils/auth-axios";
import { BASE_LAMBDA_URL } from "../constants/constants";

/**
 * Service class for BigCommerce Webhook
 */
class BigCommerceWebhook {
  constructor(apiPath, accessToken) {
    this.apiPath = apiPath;
    this.accessToken = accessToken;
    this.axios = establishConnection(apiPath, accessToken);
  }

  /**
   * Setup Webhook for handling order events
   */
  setupOrderWebhook() {
    this.axios.post('/hooks', {
      scope: 'store/order/*',
      destination: `${BASE_LAMBDA_URL}/order/handle-order`,
      is_active: true,
      headers: {}
    });
  }

  /**
   * Setup Webhook for handling product events
   */
  setupProductWebhook() {
    this.axios.post('/hooks', {
      scope: 'store/product/*',
      destination: `${BASE_LAMBDA_URL}/product/handle-product`,
      is_active: true,
      headers: {}
    });
  }

  /**
   * Setup Webhook for handling shipment events
   */
  setupShipmentWebhook() {
    this.axios.post('/hooks', {
      scope: 'store/shipment/*',
      destination: `${BASE_LAMBDA_URL}/shipment/handle-shipment`,
      is_active: true,
      headers: {}
    });
  }
};

export default BigCommerceWebhook;