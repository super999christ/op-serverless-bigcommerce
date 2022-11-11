import {
  EVENT_PRODUCT_CREATED,
  EVENT_PRODUCT_UPDATED,
} from "../../constants/constants";
import BaseController from "../base-controller";
import {
  getStoreById,
  addItem,
  removeItemsByStoreProductId,
} from "../../database/db-helpers";
import BigCommerceAPI from "../../bigcommerce/bc-api";
import { getValue100 } from "../../utils/util-helpers";

class ProductController extends BaseController {
  constructor(event) {
    super(event);
    this.parseEvent();
  }

  /**
   * Analyze & Parse event data
   */
  parseEvent() {
    this.storeId = this.body.store_id;
    this.scope = this.body.scope;
    this.baseUrl = this.body.producer;
    this.productId = this.body.data.id;
    this.eventType = "";
    if (this.scope.endsWith("created"))
      this.eventType = EVENT_PRODUCT_CREATED;
    else if (this.scope.endsWith("updated"))
      this.eventType = EVENT_PRODUCT_UPDATED;
  }

  /**
   * Process product according to ProductEvent
   */
  async processProduct() {
    let result = null;
    if (this.eventType === EVENT_PRODUCT_CREATED) {
      result = await this.processProductCreated();
    } else if (this.eventType === EVENT_PRODUCT_UPDATED) {
      result = await this.processProductUpdated();
    }
    return result;
  }

  /**
   * Process ProductCreatedEvent
   */
  async processProductCreated() {
    console.log("@ProductId: ", this.productId);

    const store = await getStoreById(this.storeId);
    if (!store) {
      // Store doesn't exist: This happens <- OP Product Created Event
      console.log("Ignoring OP Product Created Event...");
      return;
    }
    const apiService = new BigCommerceAPI(store.api_path, store.store_api_key);
    const product = await apiService.getProduct(this.productId);
    const variants = await apiService.getProductVariants(this.productId);

    console.log("@Product: ", product);
    console.log("@Variants: ", variants);

    for (let variant of variants) {
      await addItem(
        variant.sku_id,
        variant.product_id,
        this.storeId,
        product.name,
        variant.image_url,
        getValue100(variant.calculated_price)
      );
    }

    return variants;
  }

  /**
   * Process ProductUpdatedEvent
   */
  async processProductUpdated() {
    const store = await getStoreById(this.storeId);
    const apiService = new BigCommerceAPI(store.api_path, store.store_api_key);
    const product = await apiService.getProduct(this.productId);
    const variants = await apiService.getProductVariants(this.productId);

    removeItemsByStoreProductId(this.storeId, this.productId);

    for (let variant of variants) {
      console.log("Update Product...");
      console.log("@Variant: ", variant);
      await addItem(
        variant.sku_id,
        variant.product_id,
        this.storeId,
        product.name,
        variant.image_url,
        getValue100(variant.calculated_price)
      );
    }
  }
}

export default ProductController;
