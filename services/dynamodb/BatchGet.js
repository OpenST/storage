'use strict';

/**
 * DynamoDB Batch Write with retry count
 *
 * @module services/dynamodb/BatchGet
 *
 */

const rootPrefix = '../..',
  base = require(rootPrefix + '/services/dynamodb/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/dynamodb/base');

/**
 * Constructor for batch write item service class
 * @param {Object} params - Parameters
 * @param {Integer} unprocessed_keys_retry_count - retry count for unprocessed keys (optional)
 * @param {String} serviceType - type of service supported
 *
 * @constructor
 */
const DDBServiceBatchGetItem = function(params, unprocessed_keys_retry_count, serviceType) {
  const oThis = this;
  oThis.serviceType = serviceType;

  let configStrategies = oThis.ic().configStrategy;
  oThis.unprocessedKeysRetryCount =
    unprocessed_keys_retry_count || configStrategies.storage.maxRetryCount || coreConstant.defaultRetryCount();

  base.call(oThis, 'batchGetItem', params, oThis.serviceType);
};

DDBServiceBatchGetItem.prototype = Object.create(base.prototype);

const batchGetPrototype = {
  /**
   * Validation of params
   *
   * @return {*}
   */
  validateParams: function() {
    const oThis = this,
      validationResponse = base.prototype.validateParams.call(oThis);

    if (validationResponse.isFailure()) return validationResponse;

    return responseHelper.successWithData({});
  },

  /**
   * Execute dynamoDB request
   *
   * @return {promise<result>}
   *
   */
  executeDdbRequest: async function() {
    const oThis = this;

    try {
      let batchGetParams = oThis.params,
        waitTime = 0,
        constantTimeFactor = coreConstant.fixedRetryAfterTime(),
        variableTimeFactor = coreConstant.variableRetryAfterTime(),
        localResponse,
        globalResponse,
        attemptNo = 1,
        unprocessedKeys,
        unprocessedKeysLength;

      while (true) {
        logger.debug('executeDdbRequest batch_get attemptNo ', attemptNo);

        localResponse = await oThis.batchGetItemAfterWait(batchGetParams, waitTime);

        if (!localResponse.isSuccess()) {
          if (localResponse.internalErrorCode.includes('ResourceNotFoundException')) {
            logger.error(
              'services/dynamodb/BatchGet.js:executeDdbRequest, ResourceNotFoundException : attemptNo: ',
              attemptNo
            );
            localResponse.data['UnprocessedKeys'] = batchGetParams['RequestItems'];
          } else {
            return responseHelper.error({
              internal_error_identifier: 's_dy_bw_executeDdbRequest_1',
              api_error_identifier: 'exception',
              debug_options: { error: localResponse.toHash() },
              error_config: coreConstant.ERROR_CONFIG
            });
          }
        }

        if (!globalResponse) {
          globalResponse = localResponse;
        } else {
          // append response of each successful (partial/complete) attempt to globalresponse
          let localResponses = localResponse.data.Responses,
            globalResponses = globalResponse.data.Responses;
          for (let tableName in localResponses) {
            if (globalResponses.hasOwnProperty(tableName)) {
              globalResponses[tableName] = globalResponses[tableName].concat(localResponses[tableName]);
            } else {
              globalResponses[tableName] = localResponses[tableName];
            }
          }
        }

        unprocessedKeys = localResponse.data['UnprocessedKeys'];
        unprocessedKeysLength = 0;

        for (let tableName in unprocessedKeys) {
          if (unprocessedKeys.hasOwnProperty(tableName)) {
            unprocessedKeysLength += unprocessedKeys[tableName]['Keys'].length;
            logger.warn(
              'DynamoDB BATCH_GET ATTEMPT_FAILED TableName :',
              tableName,
              ' unprocessedItemsCount: ',
              unprocessedKeysLength,
              ' keys count: ',
              batchGetParams.RequestItems[tableName]['Keys'].length,
              ' attemptNo ',
              attemptNo
            );
            if (oThis.unprocessedKeysRetryCount) {
              logger.info('Retry will be attempted.');
            }
          }
        }

        // Break the loop if unprocessedItems get empty or retry count exceeds the given limit
        if (unprocessedKeysLength === 0 || oThis.unprocessedKeysRetryCount === 0) {
          globalResponse.data.UnprocessedKeys = unprocessedKeys;
          break;
        }

        //Create new batchWriteParams of unprocessedItems
        batchGetParams = { RequestItems: unprocessedKeys };

        //adjust retry variables
        waitTime = constantTimeFactor + attemptNo * variableTimeFactor;
        attemptNo += 1;
        oThis.unprocessedKeysRetryCount -= 1;
      }

      for (let tableName in unprocessedKeys) {
        if (unprocessedKeys.hasOwnProperty(tableName)) {
          logger.error(
            'DynamoDB BATCH_GET ALL_ATTEMPTS_FAILED TableName :',
            tableName,
            ' unprocessedItemsCount: ',
            unprocessedKeysLength,
            ' attempts Failed ',
            attemptNo
          );
        }
      }

      logger.debug('=======Base.perform.result=======');
      logger.debug(globalResponse);

      return globalResponse;
    } catch (err) {
      logger.error('services/dynamodb/BatchGet.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_bw_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstant.ERROR_CONFIG
      });
    }
  },

  /**
   * Batch get Item after waiting for given time
   * @param {Object} batchGetKeys - Batch get keys
   * @param {Integer} waitTime - wait time in milliseconds
   * @return {Promise<any>}
   */
  batchGetItemAfterWait: async function(batchGetKeys, waitTime) {
    const oThis = this;

    return new Promise(function(resolve) {
      setTimeout(async function() {
        let r = await oThis
          .ic()
          .getInstanceFor(coreConstant.icNameSpace, 'libDynamoDBBase')
          .queryDdb(oThis.methodName, oThis.serviceType, batchGetKeys);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(DDBServiceBatchGetItem.prototype, batchGetPrototype);
DDBServiceBatchGetItem.prototype.constructor = batchGetPrototype;

InstanceComposer.registerAsShadowableClass(DDBServiceBatchGetItem, coreConstant.icNameSpace, 'DDBServiceBatchGetItem');

module.exports = DDBServiceBatchGetItem;
