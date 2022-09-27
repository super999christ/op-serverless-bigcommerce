// Internal dependencies
import BaseController from "../base-controller";

class SecretController extends BaseController {
  constructor(event) {
    super(event);
    this.parseEvent();
  }

  parseEvent() {
    this.apiPath = this.body.apiPath;
    this.clientId = this.body.clientId;
    this.clientSecret = this.body.clientSecret;
    this.accessToken = this.body.accessToken;
  }

  getSecret() {
    return {
      apiPath: this.apiPath,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: this.accessToken
    };
  }
}

export default SecretController;