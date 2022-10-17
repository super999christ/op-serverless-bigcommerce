// Internal dependencies
import BaseController from "../base-controller";
import BigCommerceAPI from "../../bigcommerce/bc-api";
import BigCommerceWebhook from "../../bigcommerce/bc-webhook";
import { ERROR_GN_ORDER_CREATE_FAILED } from "../../constants/errors";
import { getPriceTierIdByPrice, addUser, addMerchant, addStoreSetting, addStore, addItem } from '../../database/db-helpers';
import { UserType } from "../../constants/constants";
import { getValue100 } from "../../utils/util-helpers";

class OnboardController extends BaseController {
  constructor(event) {
    super(event);
    this.parseEvent();
  }

  /**
   * Analyze & Parse event data
   */
  parseEvent() {
    this.firstName = this.body.firstName;
    this.lastName = this.body.lastName;
    this.email = this.body.email;
    this.password = this.body.password;
    this.billingEmail = this.body.billingEmail;
    this.supportEmail = this.body.supportEmail;
    this.revSharePercent = Number(this.body.revSharePercent);
    this.opFee = Number(this.body.opFee);
    this.apiPath = this.body.apiPath;
    this.clientId = this.body.clientId;
    this.clientSecret = this.body.clientSecret;
    this.accessToken = this.body.accessToken;
  }

  /**
   * Returns store credentials
   */
  getSecret() {
    return {
      apiPath: this.apiPath,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: this.accessToken
    };
  }

  /**
   * Process StoreOnboardedEvent
   */
  async processStoreOnboarded() {
    const webhookService = new BigCommerceWebhook(
      this.apiPath,
      this.accessToken
    );
    const apiService = new BigCommerceAPI(
      this.apiPath,
      this.accessToken
    );

    try {
      // Setup Order|Product|Shipment-related webhooks
      console.log('Setup webhooks...');
      await webhookService.setupOrderWebhook();
      await webhookService.setupProductWebhook();
      await webhookService.setupShipmentWebhook();

      // Create an OP product
      console.log('Create OP products...');
      const product = await apiService.createOPProduct();
      // Find variantID
      const variant = product.variants.find(
        (item) => item.price === this.opFee
      );
      // Find PriceTierId
      const priceTierId = await getPriceTierIdByPrice(this.opFee);

      console.log("@Variant: ", variant);
      console.log("@PriceTierId: ", priceTierId);

      // Get Store metadata
      const storeMetadata = await apiService.getStoreMetadata();

      console.log("@StoreMetadata: ", storeMetadata);

      // Create a user
      const user = await addUser(
        this.firstName,
        this.lastName,
        this.email,
        this.password,
        UserType.MERCHANT
      );

      console.log("@User: ", user);

      // Create a merchant
      const merchant = await addMerchant(
        user["id"],
        this.billingEmail,
        this.supportEmail
      );

      console.log("@Merchant: ", merchant);

      // Create a store
      const store = await addStore(
        storeMetadata.store_id,
        merchant["id"],
        storeMetadata.name,
        this.revSharePercent,
        variant.id,
        priceTierId,
        this.apiPath,
        this.clientId,
        this.clientSecret,
        this.accessToken
      );

      console.log("@Store: ", store);

      // Create a storeSetting
      const storeSetting = await addStoreSetting(storeMetadata.control_panel_base_url);
      console.log("@StoreSetting: ", storeSetting);

      // Get all variants (async)
      Promise.all([
        apiService.getStoreProducts(),
        apiService.getStoreVariants(),
      ]).then((result) => {
        const products = result[0];
        const variants = result[1];
        console.log("@StoreProduct: ", products);
        console.log("@StoreVariants: ", variants);
        const productById = {};
        products.forEach((product) => {
          productById[product.id] = product;
        });
        variants.forEach((variant) => {
          addItem(
            variant.sku_id,
            variant.product_id,
            storeMetadata.store_id,
            productById[variant.product_id].name,
            variant.image_url,
            getValue100(variant.calculated_price)
          );
        });
      });

      return store;
    } catch(err) {
      console.log("#Onboarding Error: ", err);
      this.error = {
        type: ERROR_GN_ORDER_CREATE_FAILED,
        detail: err,
      };
      return null;
    }
  }
}

export default OnboardController;