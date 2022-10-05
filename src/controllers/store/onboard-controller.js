// Internal dependencies
import BaseController from "../base-controller";

class OnboardController extends BaseController {
  constructor(event) {
    super(event);
    this.parseEvent();
  }

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

  getSecret() {
    return {
      apiPath: this.apiPath,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: this.accessToken
    };
  }
}

export default OnboardController;