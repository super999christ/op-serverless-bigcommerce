import { EVENT_ORDER_CREATED, OP_PRODUCT_NAME } from "../../constants/constants";
import BaseController from "../base-controller";
import BigCommerceAPI from "../../bigcommerce/bc-api";
import {
  addOrder,
  addOrderInsurance,
  addOrderItem,
  getStoreById,
  getTodayRate,
} from "../../database/db-helpers";
import { getFullAddress, getFullName, getValue100 } from "../../utils/util-helpers";
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
    if (this.scope.endsWith("created"))
      this.eventType = EVENT_ORDER_CREATED;
  }

  /**
   * Process order according to the OrderEvent
   */
  async processOrder() {
    let result = null;
    if (this.eventType === EVENT_ORDER_CREATED)
      result  = await this.processOrderCreated();
    return result;
  }

  /**
   * Process OrderCreatedEvent
   */
  async processOrderCreated() {
    try {
      const store = await getStoreById(this.storeId);
      console.log('@Store: ', store);
      const apiService = new BigCommerceAPI(store.api_path, store.access_token);
      const order = await apiService.getOrder(this.orderId);
      console.log('@Order: ', order);

      const customer = await apiService.getCustomer(order.customer_id);
      const shippingAddresses = await apiService.getShippingAddresses(order.id);
      const products = await apiService.getOrderProducts(order.id);
      const orderProtectionItemExists = products.find(item => item.name === "Order Protection");

      console.log('@Customer: ', customer);
      console.log('@ShippingAddresses: ', shippingAddresses);
      console.log('@Products: ', products);
      console.log('@OrderProtectionItemExists: ', orderProtectionItemExists);

      console.log("@@@Date: ", order.date_created);
      const rateItem = await getTodayRate(order.date_created, order.currency);
      const exchangeRate = rateItem ? rateItem.exchange_rate : 1;

      console.log('@ExchangeRate: ', exchangeRate);

      const addedOrders = {};
      for (const shippingAddress of shippingAddresses) {
        console.log('Adding order...');
        const customerName = getFullName(customer.first_name, customer.last_name);
        const dateCreated = order.date_created;
        const shippingFullAddress = getFullAddress(
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
        const orderId = order.id;
        const orderEmail = shippingAddress.email;
        const postalCode = shippingAddress.zip;
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
        const storeId = this.storeId;

        // Calculate `order_total` and `order_shipping`
        let orderTotal = 0;
        let orderShipping = 0;
        products.forEach(product => {
          if (product.order_address_id === shippingAddress.id) {
            orderTotal += getValue100(product.total_inc_tax);                       // TODO: check logic
            orderShipping += getValue100(product.fixed_shipping_cost);              // TODO: check logic
            for (const discount of product.applied_discounts) {
              orderTotal -= getValue100(discount.amount);
            }
          }
        });

        order.shippingAddress = shippingAddress;
        const addedOrder = await addOrder(
          customerName,
          dateCreated,
          shippingFullAddress,
          null,
          phoneNumber,
          orderTotal,
          orderShipping,
          orderId,
          orderEmail,
          postalCode,
          storeId,
          JSON.stringify(order),
          billingFullAddress,
          billingPhoneNumber,
          billingName,
          orderProtectionItemExists
        );
        addedOrders[shippingAddress.id] = addedOrder;
      }

      for (const product of products) {
        // Calculate applied discount of product
        let totalDiscount = 0;
        for (const discount of product.applied_discounts) {
          totalDiscount += getValue100(discount.amount);
        }
        if (product.name === OP_PRODUCT_NAME) {
          // Add `orderInsurance`
          console.log('Adding order insurance...');
          const insuranceCost = getValue100(product.base_price * product.quantity);
          await addOrderInsurance(
            insuranceCost * exchangeRate,
            totalDiscount * exchangeRate,
            addedOrders[product.order_address_id].id,
            insuranceCost    // TODO: What is original price?
          );
        } else {
          // Add `orderItem`
          console.log('Adding order item...');
          await addOrderItem(
            addedOrders[product.order_address_id].id,
            product.product_id,
            product.variant_id,
            product.quantity,
            totalDiscount
          );
        }
      }

      return addedOrders;
    } catch(err) {
      console.log("#OrderCreate Error: ", err);
      this.error = {
        type: ERROR_GN_ORDER_CREATE_FAILED,
        detail: err
      };
      return null;
    }
  }
}

export default OrderController;
