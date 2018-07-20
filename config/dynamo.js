"use strict";

//Load external files
require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk')
  , AWSDaxClient = require('amazon-dax-client')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

/**
 * Constructor for DynamoDB Config
 *
 * @constructor
 */
const DynamoConfigFactory = function(configStrategies, instanceComposer) {
};

DynamoConfigFactory.prototype = {

  /**
   * Type Raw
   *
   * @constant {string}
   *
   */
  raw: 'raw'

  /**
   * Type DocumentClient
   *
   * @constant {string}
   *
   */
  , dax: 'dax'

  , connectionParams: {}

  /**
   * Get provider
   *
   * @param {string} preferredEndpoint - type of service, either raw or dax
   * @returns <object> - DynamoDB/Dax connection object
   *
   */
  , getProvider: async function (preferredEndpoint) {
    const oThis = this
    ;

    let configStrategies = oThis.ic().configStrategy;

    if (configStrategies.OS_DAX_ENABLED == 1 && preferredEndpoint === oThis.dax) {
      return await oThis.createDaxObject({
        apiVersion: configStrategies.OS_DAX_API_VERSION,
        accessKeyId: configStrategies.OS_DAX_ACCESS_KEY_ID,
        secretAccessKey: configStrategies.OS_DAX_SECRET_ACCESS_KEY,
        region: configStrategies.OS_DAX_REGION,
        endpoint: configStrategies.OS_DAX_ENDPOINT,
        sslEnabled: configStrategies.OS_DAX_SSL_ENABLED,
        logger: configStrategies.logger
      });
    }
    else {
      return await oThis.createRawObject({
        apiVersion: configStrategies.OS_DYNAMODB_API_VERSION,
        accessKeyId: configStrategies.OS_DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: configStrategies.OS_DYNAMODB_SECRET_ACCESS_KEY,
        region: configStrategies.OS_DYNAMODB_REGION,
        endpoint: configStrategies.OS_DYNAMODB_ENDPOINT,
        sslEnabled: configStrategies.OS_DYNAMODB_SSL_ENABLED,
        logger: configStrategies.logger
      });
    }
  }

  , createRawObject: async function (connectionParams) {
    return await new AWS.DynamoDB(connectionParams);
  }

  , createDaxObject: async function (connectionParams) {
    return await new AWSDaxClient(connectionParams);
  }

};

InstanceComposer.register(DynamoConfigFactory, 'getDynamoConfigFactory', true);

module.exports = DynamoConfigFactory;