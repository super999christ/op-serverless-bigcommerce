import axios from "axios";

/**
 * Configures axios with baseURL and accessToken
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

export {
  establishConnection
};