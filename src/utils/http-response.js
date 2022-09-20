// Internal dependencies
import { DEFAULT_RESPONSE_TYPE } from "../constants/constants";

/**
 * Builds http response object
 * @param {number} statusCode
 * @param {object|string} body
 * @param {string} contentType
 * @returns Return http response object
 */
const buildResponse = (statusCode, body, contentType) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": contentType
    },
    body: contentType === DEFAULT_RESPONSE_TYPE ? JSON.stringify(body) : body
  }
}

/**
 * Returns success http response with status 200
 * @param {object|string} body
 * @param {string} contentType (optional) - application/json as default
 * @returns Return http success response with status 200
 */
const success = (body, contentType = DEFAULT_RESPONSE_TYPE) => {
  return buildResponse(200, body, contentType);
};

/**
 * Returns failure http response with status code parameter
 * @param {object|string} body
 * @param {number} statusCode (optional) - 500 as default
 * @param {string} contentType (optional) - application/json as default
 * @returns Return failure http response with status code
 */
const failure = (body, statusCode = 500, contentType = DEFAULT_RESPONSE_TYPE) => {
  return buildResponse(statusCode, body, contentType);
}

export {
  success,
  failure
};