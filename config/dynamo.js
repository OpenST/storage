"use strict";

//Load external files
require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk')
  , AWSDaxClient = require('amazon-dax-client');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

/**
 * Constructor for DynamoDB Config
 *
 * @constructor
 */
const dynamoConfig = function() {
};

dynamoConfig.prototype = {

  /**
   * Type Raw
   *
   * @constant {string}
   *
   */
  raw: 'raw'
  ,

  /**
   * Type DocumentClient
   *
   * @constant {string}
   *
   */
  dax: 'dax'
  ,

  connectionParams: {}
  ,

  /**
   * Get provider
   *
   * @param connectionStrategies: connectionParams of client
   * @param serviceType: type of service, either raw or dax
   * @returns DynamoDB connection object
   *
   */
  getProvider: async function (connectionStrategies, serviceType) {
    const oThis = this;
    if (connectionStrategies.OS_DAX_ENABLED && serviceType === oThis.dax) {
      let connectionParams = oThis.getConfig(connectionStrategies, oThis.dax);
      return await oThis.createDaxObject(connectionParams);
    }
    else {
      let connectionParams = oThis.getConfig(connectionStrategies, oThis.raw);
      return await oThis.createRawObject(connectionParams);
    }
  },

  createRawObject: async function (connectionParams) {
    return await new AWS.DynamoDB(connectionParams);
  },

  createDaxObject: function (connectionParams) {
    return new AWSDaxClient(connectionParams);
  },

  getConfig: function (connectionStrategies, serviceType) {
    const oThis = this;
    let connectionParams;
    if (serviceType === oThis.raw) {
      connectionParams = {
        apiVersion: connectionStrategies.OS_DYNAMODB_API_VERSION,
        accessKeyId: connectionStrategies.OS_DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: connectionStrategies.OS_DYNAMODB_SECRET_ACCESS_KEY,
        region: connectionStrategies.OS_DYNAMODB_REGION,
        endpoint: connectionStrategies.OS_DYNAMODB_ENDPOINT,
        sslEnabled: connectionStrategies.OS_DYNAMODB_SSL_ENABLED
      }
    }
    else if(serviceType === oThis.dax) {
      connectionParams = {
        apiVersion: connectionStrategies.OS_DAX_API_VERSION,
        accessKeyId: connectionStrategies.OS_DAX_ACCESS_KEY_ID,
        secretAccessKey: connectionStrategies.OS_DAX_SECRET_ACCESS_KEY,
        sslEnabled: connectionStrategies.OS_DYNAMODB_SSL_ENABLED
      };
      if (connectionStrategies.OS_DAX_ENABLED) {
        connectionParams.endpoint = connectionStrategies.OS_DAX_ENDPOINT;
        connectionParams.region = connectionStrategies.OS_DAX_REGION
      }
      else {
        connectionParams.endpoint = connectionStrategies.OS_DYNAMODB_ENDPOINT;
        connectionParams.region = connectionStrategies.OS_DYNAMODB_REGION
      }
    }
    connectionParams.logger = connectionStrategies.OS_DYNAMODB_LOGGING_ENABLED;
    return connectionParams;
  }

};

module.exports = new dynamoConfig();