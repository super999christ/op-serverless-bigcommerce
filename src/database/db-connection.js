// External dependencies
import { Pool } from "pg";

// Internal dependencies
import {DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME} from '../constants/constants';

const connection = {
  ssl: process.env.IS_OFFLINE ? false : { rejectUnauthorized: false },
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

const dbClient = new Pool(connection);
const executeQuery = (query, params) => {
  return dbClient.query(query, params);
};

export {
  dbClient,
  executeQuery
};