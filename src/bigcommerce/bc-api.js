import {
  establishConnection,
  establishConnectionV2,
} from "../utils/auth-axios";
import { variantPrices } from "../constants/constants";

/**
 * Service class for BigCommerce API
 */
class BigCommerceAPI {
  constructor(apiPath, accessToken) {
    this.apiPath = apiPath;
    this.accessToken = accessToken;
    this.axios = establishConnection(
      apiPath,
      accessToken
    );
    this.axiosV2 = establishConnectionV2(
      apiPath,
      accessToken
    );
  }

  /**
   * Creates an OP product and 100 types of variants
   */
  async createOPProduct() {
    const variants = variantPrices.map((price, index) => ({
      price: price,
      sku: index === 0 ? "BASE" : `TIER${index}`,
      is_free_shipping: true,
      option_values: [
        {
          option_display_name: 'Price',
          label: `$${price}`,
        },
      ],
    }));
    // create a new OP product on BigCommerce
    const product = (
      await this.axios.post("/catalog/products", {
        name: "Order Protection",
        type: "digital",
        sku: "ORDERP",
        weight: 0,
        price: 0,
        description:
          '<p><a href="https://orderprotection.com">OrderProtection.com</a> is offered as an additional item at checkout. There’s no extra application process or forms to fill out, customers just checkout and are instantly protected against items:<br></p><ul><li>Stolen</li><li>Delivered Not Received</li><li>Damaged Item</li><li>Lost in Transit</li><li>Wrong Item</li></ul>',
        variants: variants,
        images: [
          {
            image_url: 'https://order-protection-static.s3-us-west-1.amazonaws.com/logo.png',
            is_thumbnail: true
          }
        ]
      })
    ).data.data;

    return product;
  }

  /**
   * Fetches metadata of the current store
   */
  async getStoreMetadata() {
    const metadata = (await this.axiosV2.get("/store")).data;
    return metadata;
  }

  /**
   * Fetches order by id
   */
  async getOrder(orderId) {
    const order = (await this.axiosV2.get(`/orders/${orderId}`)).data;
    return order;
  }

  /**
   * Fetches customer by id
   */
  async getCustomer(customerId) {
    const customer = (await this.axiosV2.get(`/customers/${customerId}`)).data;
    return customer;
  }

  /**
   * Fetches shipping addresses by orderId
   */
  async getShippingAddresses(orderId) {
    const addresses = (await this.axiosV2.get(`/orders/${orderId}/shipping_addresses`)).data;
    return addresses;
  }

  /**
   * Fetches order products by orderId
   */
  async getOrderProducts(orderId) {
    const products = (await this.axiosV2.get(`/orders/${orderId}/products`)).data;
    return products;
  }

  /**
   * Fetches all the store variants
   */
  async getStoreVariants() {
    const variants = (await this.axios.get('/catalog/variants')).data;
    return variants.data;
  }

  /**
   * Fetches all the store products
   */
  async getStoreProducts() {
    const products = (await this.axios.get('/catalog/products')).data;
    return products.data;
  }

  /**
   * Fetches product by id
   */
  async getProduct(productId) {
    const product = (await this.axios.get(`/catalog/products/${productId}`)).data;
    return product.data;
  }

  /**
   * Fetches all product variants
   */
  async getProductVariants(productId) {
    const variants = (await this.axios.get(`/catalog/products/${productId}/variants`)).data;
    return variants.data;
  }

  /**
   * Fetches all order shipments by orderId
   */
  async getOrderShipments(orderId) {
    const shipments = (await this.axiosV2.get(`/orders/${orderId}/shipments`)).data;
    return shipments;
  }
}

export default BigCommerceAPI;
