import axios from "axios";

/**
 * Configures axios with baseURL and accessToken (API V3)
 * @param {string} baseUrl API Path
 * @param {string} accessToken API Key
 * @returns new axios object
 */
const establishConnection = (baseUrl, accessToken) => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': accessToken
    }
  });
};

/**
 * Configures axios with baseURL and accessToken (API V2)
 * @param {string} baseUrl API V3 Path
 * @param {string} accessToken API Key
 * @returns new axios object
 */
const establishConnectionV2 = (baseUrl, accessToken) => {
  baseUrl = baseUrl.replace('/v3', '/v2');
  return establishConnection(baseUrl, accessToken);
};

export {
  establishConnection,
  establishConnectionV2
};