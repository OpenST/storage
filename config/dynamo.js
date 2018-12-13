'use strict';

//Load external files
require('http').globalAgent.keepAlive = true;
const rootPrefix = '..';
const AWS = require('aws-sdk'),
  AWSDaxClient = require('amazon-dax-client'),
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

/**
 * Constructor for DynamoDB Config
 *
 * @constructor
 */
const DynamoConfigFactory = function(configStrategies, instanceComposer) {};

DynamoConfigFactory.prototype = {
  /**
   * Type Raw
   *
   * @constant {string}
   *
   */
  raw: 'raw',

  /**
   * Type DocumentClient
   *
   * @constant {string}
   *
   */
  dax: 'dax',

  connectionParams: {},

  /**
   * Get provider
   *
   * @param {string} preferredEndpoint - type of service, either raw or dax
   * @returns {object} - DynamoDB/Dax connection object
   *
   */
  getProvider: async function(preferredEndpoint) {
    const oThis = this;

    let configStrategies = oThis.ic().configStrategy;

    if (configStrategies.storage.enableDax == 1 && preferredEndpoint === oThis.dax) {
      return await oThis.createDaxObject({
        apiVersion: configStrategies.DAX_API_VERSION,
        accessKeyId: configStrategies.DAX_ACCESS_KEY_ID,
        secretAccessKey: configStrategies.DAX_SECRET_ACCESS_KEY,
        region: configStrategies.DAX_REGION,
        endpoint: configStrategies.DAX_ENDPOINT,
        sslEnabled: configStrategies.DAX_SSL_ENABLED == 1,
        logger: configStrategies.storage.enableLogging == 1 ? console : ''
      });
    } else {
      return await oThis.createRawObject({
        apiVersion: configStrategies.storage.apiVersion,
        accessKeyId: configStrategies.storage.apiKey,
        secretAccessKey: configStrategies.storage.apiSecret,
        region: configStrategies.storage.region,
        endpoint: configStrategies.storage.endpoint,
        sslEnabled: configStrategies.storage.enableSsl == 1,
        logger: configStrategies.storage.enableLogging == 1 ? console : ''
      });
    }
  },

  //  apiVersion-accessKeyId-region-endpoint-sslEnabled

  createRawObject: async function(connectionParams) {
    return await new AWS.DynamoDB(connectionParams);
  },

  createDaxObject: async function(connectionParams) {
    return await new AWSDaxClient(connectionParams);
  }
};

InstanceComposer.registerAsObject(DynamoConfigFactory, coreConstants.icNameSpace, 'getDynamoConfigFactory', true);

module.exports = DynamoConfigFactory;
