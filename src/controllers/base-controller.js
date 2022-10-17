/**
 * Base controller for lambda functions
 */
class BaseController {
  constructor(event) {
    console.log("@BaseEvent: ", event);
    this.event = event;
    this.method = event.httpMethod;
    this.queryStringParameters = event.queryStringParameters || {};
    this.pathParameters = event.pathParameters || {};
    this.error = null;
    try {
      this.body = JSON.parse(event.body);
    } catch(err) {
      this.body = {};
    }
  }

  /**
   * Returns whether error occurred or not during the process
   */
  isError() {
    return Boolean(this.error);
  }

  /**
   * Returns error occurred during the process
   */
  getError() {
    return this.error;
  }
}

export default BaseController;