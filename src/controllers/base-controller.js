/**
 * Base controller for lambda functions
 */
class BaseController {
  constructor(event) {
    this.event = event;
    this.method = event.httpMethod;
    this.queryStringParameters = event.queryStringParameters || {};
    this.body = event.body || '';
    this.pathParameters = event.pathParameters || {};
  }
}

export default BasicController;