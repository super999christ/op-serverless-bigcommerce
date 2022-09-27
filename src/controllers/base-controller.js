/**
 * Base controller for lambda functions
 */
class BaseController {
  constructor(event) {
    this.event = event;
    this.method = event.httpMethod;
    this.queryStringParameters = event.queryStringParameters || {};
    this.pathParameters = event.pathParameters || {};
    try {
      this.body = JSON.parse(event.body);
    } catch(err) {
      this.body = {};
    }
  }
}

export default BaseController;