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
   * @param configStrategies: connectionParams of client
   * @param serviceType: type of service, either raw or dax
   * @returns DynamoDB connection object
   *
   */
  getProvider: async function (configStrategies, serviceType) {
    const oThis = this;
    if (configStrategies.OS_DAX_ENABLED && serviceType === oThis.dax) {
      let connectionParams = oThis.getDaxConfig(configStrategies);
      return await oThis.createDaxObject(connectionParams);
    }
    else {
      let connectionParams = oThis.getRawConfig(configStrategies);
      return await oThis.createRawObject(connectionParams);
    }
  },

  createRawObject: async function (connectionParams) {
    return await new AWS.DynamoDB(connectionParams);
  },

  createDaxObject: async function (connectionParams) {
    return await new AWSDaxClient(connectionParams);
  },

  getDaxConfig: function(configStrategies) {
    let connectionParams;
    connectionParams = {
      apiVersion: configStrategies.OS_DAX_API_VERSION,
      accessKeyId: configStrategies.OS_DAX_ACCESS_KEY_ID,
      secretAccessKey: configStrategies.OS_DAX_SECRET_ACCESS_KEY,
      sslEnabled: configStrategies.OS_DYNAMODB_SSL_ENABLED,
      endpoint: configStrategies.OS_DAX_ENDPOINT,
      region: configStrategies.OS_DAX_REGION,
      logger: configStrategies.OS_DYNAMODB_LOGGING_ENABLED
    };
    return connectionParams;
  },

  getRawConfig: function (configStrategies) {
    let connectionParams;
      connectionParams = {
        apiVersion: configStrategies.OS_DYNAMODB_API_VERSION,
        accessKeyId: configStrategies.OS_DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: configStrategies.OS_DYNAMODB_SECRET_ACCESS_KEY,
        region: configStrategies.OS_DYNAMODB_REGION,
        endpoint: configStrategies.OS_DYNAMODB_ENDPOINT,
        sslEnabled: configStrategies.OS_DYNAMODB_SSL_ENABLED,
        logger: configStrategies.OS_DYNAMODB_LOGGING_ENABLED
      };
    return connectionParams;
  }
};

module.exports = new dynamoConfig();