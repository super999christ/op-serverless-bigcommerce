import {
  EVENT_ORDER_CREATED,
  OP_PRODUCT_NAME,
  EVENT_ORDER_UPDATED,
  ORDER_STATUS_SHIPPED,
} from "../../constants/constants";
import BaseController from "../base-controller";
import BigCommerceAPI from "../../bigcommerce/bc-api";
import {
  addOrder,
  addOrderInsurance,
  addOrderItem,
  getItemByStoreVariantId,
  getOrderByStoreOrderId,
  getStoreById,
  getTodayRate,
  addItem,
  addFulfillment,
  removeFulfillmentsByOrderId,
  removeItemsByStoreVariantId,
  addOrderShipment
} from "../../database/db-helpers";
import {
  getFullAddress,
  getFullName,
  getValue100,
} from "../../utils/util-helpers";
import { ERROR_GN_ORDER_CREATE_FAILED } from "../../constants/errors";
class OrderController extends BaseController {
  constructor(event) {
    super(event);
    this.parseEvent();
  }

  /**
   * Analyze & Parse event data
   */
  parseEvent() {
    this.storeId = this.body.store_id;
    this.scope = this.body.scope; // e.g. `store/order/created`
    this.baseUrl = this.body.producer; // e.g. `stores/{store_hash}`
    this.orderId = this.body.data.id;
    this.eventType = "";
    if (this.scope.endsWith("created")) this.eventType = EVENT_ORDER_CREATED;
    else if (this.scope.endsWith("updated"))
      this.eventType = EVENT_ORDER_UPDATED;
  }

  /**
   * Process order according to the OrderEvent
   */
  async processOrder() {
    let result = null;
    if (this.eventType === EVENT_ORDER_CREATED)
      result = await this.processOrderCreated();
    else if (this.eventType === EVENT_ORDER_UPDATED)
      result = await this.processOrderUpdated();
    return result;
  }

  /**
   * Process OrderCreatedEvent
   */
  async processOrderCreated() {
    try {
      const store = await getStoreById(this.storeId);
      console.log("@Store: ", store);
      const apiService = new BigCommerceAPI(store.api_path, store.store_api_key);
      const order = await apiService.getOrder(this.orderId);
      console.log("@Order: ", order);

      const customer = await apiService.getCustomer(order.customer_id);
      const shippingAddresses = await apiService.getShippingAddresses(order.id);
      const products = await apiService.getOrderProducts(order.id);
      const orderProtectionItemExists = !!products.find(
        (item) => item.name === OP_PRODUCT_NAME
      );

      console.log("@Customer: ", customer);
      console.log("@ShippingAddresses: ", shippingAddresses);
      console.log("@Products: ", products);
      console.log("@OrderProtectionItemExists: ", orderProtectionItemExists);

      console.log("@@@Date: ", order.date_created);
      const rateItem = await getTodayRate(order.date_created, order.currency);
      const exchangeRate = rateItem ? rateItem.exchange_rate : 1;

      console.log("@ExchangeRate: ", exchangeRate);

      // Check whether order already exists in the DB
      const orderExists = (await getOrderByStoreOrderId(store.id, order.id)) != null;

      if (!orderExists) {
        console.log("Adding order...");
        const customerName = getFullName(
          customer.first_name,
          customer.last_name
        );
        const dateCreated = order.date_created;

        // Multiple shipping addresses
        const shippingFullAddresses = [];
        const shippingPhoneNumbers = [];
        const shippingEmails = [];
        const shippingPostalCodes = [];
        const shippingCustomers = [];
        for (const shippingAddress of shippingAddresses) {
          const fullAddress = getFullAddress(
            shippingAddress.company,
            shippingAddress.street_1,
            shippingAddress.street_2,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zip,
            shippingAddress.country_iso2,
            shippingAddress.country
          );
          const phoneNumber = shippingAddress.phone;
          const email = shippingAddress.email;
          const postalCode = shippingAddress.zip;

          shippingFullAddresses.push(fullAddress);
          shippingPhoneNumbers.push(phoneNumber);
          shippingEmails.push(email);
          shippingPostalCodes.push(postalCode);
          shippingCustomers.push(getFullName(shippingAddress.first_name, shippingAddress.last_name));
        }

        // Calculate `order_total` and `order_shipping`
        let orderTotal = 0;
        let orderShipping = 0;
        products.forEach((product) => {
          orderTotal += getValue100(product.total_inc_tax);
          orderShipping += getValue100(product.fixed_shipping_cost);
          for (const discount of product.applied_discounts) {
            orderTotal -= getValue100(discount.amount);
          }
        });

        const orderId = order.id;
        const storeOrderId = order.id;

        const billingFullAddress = getFullAddress(
          order.billing_address.company,
          order.billing_address.street_1,
          order.billing_address.street_2,
          order.billing_address.city,
          order.billing_address.state,
          order.billing_address.zip,
          order.billing_address.country_iso2,
          order.billing_address.country
        );
        const billingPhoneNumber = order.billing_address.phone;
        const billingName = getFullName(
          order.billing_address.first_name,
          order.billing_address.last_name
        );

        const addedOrder = await addOrder(
          customerName,
          dateCreated,
          JSON.stringify(shippingFullAddresses),
          null,
          JSON.stringify(shippingPhoneNumbers),
          JSON.stringify(shippingCustomers),
          orderTotal,
          orderShipping,
          storeOrderId,
          orderId,
          JSON.stringify(shippingEmails),
          JSON.stringify(shippingPostalCodes),
          store.id,
          JSON.stringify(order),
          billingFullAddress,
          billingPhoneNumber,
          billingName,
          orderProtectionItemExists === false
        );

        // Add multiple shipping addresses to related table `order_shipment`
        for (const shippingAddress of shippingAddresses) {
          const fullAddress = getFullAddress(
            shippingAddress.company,
            shippingAddress.street_1,
            shippingAddress.street_2,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zip,
            shippingAddress.country_iso2,
            shippingAddress.country
          );
          const phoneNumber = shippingAddress.phone;
          const email = shippingAddress.email;
          const postalCode = shippingAddress.zip;

          console.log("Adding order shipment...");
          console.log("@FullAddress: ", fullAddress);
          await addOrderShipment(addedOrder.id, shippingAddress.id, fullAddress, phoneNumber, email, postalCode);
        }

        for (const product of products) {
          // Calculate applied discount of product
          let totalDiscount = 0;
          for (const discount of product.applied_discounts) {
            totalDiscount += getValue100(discount.amount);
          }
          if (product.name === OP_PRODUCT_NAME) {
            // Add `orderInsurance`
            console.log("Adding order insurance...");
            const insuranceCost = getValue100(
              product.base_price * product.quantity
            );
            await addOrderInsurance(
              insuranceCost * exchangeRate,
              totalDiscount * exchangeRate,
              addedOrder.id,
              insuranceCost // TODO: What is original price?
            );
          } else {
            let variant = await getItemByStoreVariantId(
              this.storeId,
              product.variant_id
            );
            if (product.variant_id && !variant) {
              // Add `item`
              console.log("Adding item...");
              await removeItemsByStoreVariantId(
                this.storeId,
                product.variant_id
              );
              variant = await addItem(
                product.variant_id,
                product.product_id,
                this.storeId,
                product.name,
                null,
                getValue100(product.base_price)
              );
            }
            // Add `orderItem`
            console.log("Adding order item...");
            await addOrderItem(
              addedOrder.id,
              variant.id, // TODO: should be itemId from `items` table
              product.id, // TODO: should be lineItemId
              product.quantity,
              totalDiscount,
              product.order_address_id
            );
          }
        }
        return addedOrder;
      }
      return {};
    } catch (err) {
      console.log("#OrderCreate Error: ", err);
      this.error = {
        type: ERROR_GN_ORDER_CREATE_FAILED,
        detail: err,
      };
      return null;
    }
  }

  /**
   * Process OrderUpdatedEvent
   */
  async processOrderUpdated() {
    const store = await getStoreById(this.storeId);
    const apiService = new BigCommerceAPI(store.api_path, store.store_api_key);
    const orderFromAPI = await apiService.getOrder(this.orderId);
    const orderFromDB = await getOrderByStoreOrderId(store.id, this.orderId);

    // Removes all existing fulfillments of the same order
    removeFulfillmentsByOrderId(this.storeId, this.orderId);

    const orderStatus = orderFromAPI.status_id;
    console.log("@OrderStatus: ", orderStatus);
    if (orderStatus === ORDER_STATUS_SHIPPED) {
      // Get all shipments of the order
      const shipments = await apiService.getOrderShipments(this.orderId);
      console.log("@Shipments: ", shipments);
      for (let shipment of shipments) {
        // Iterate items in the shipment
        for (let item of shipment.items) {
          // Add a new fulfillment of item
          await addFulfillment(
            item.quantity,
            shipment.tracking_carrier,
            shipment.tracking_number,
            shipment.tracking_link,
            item.order_product_id,
            orderFromDB.id
          );
        }
      }
      return shipments;
    }
    return null;
  }
}

export default OrderController;
