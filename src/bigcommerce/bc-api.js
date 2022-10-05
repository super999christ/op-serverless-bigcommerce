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
}

export default BigCommerceAPI;
