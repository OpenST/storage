'use strict';

/**
 * DynamoDB Batch Write with retry count
 *
 * @module services/dynamodb/batch_get
 *
 */

const rootPrefix = '../..',
  base = require(rootPrefix + '/services/dynamodb/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

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
const BatchGetItem = function(params, unprocessed_keys_retry_count, serviceType) {
  const oThis = this;
  oThis.serviceType = serviceType;

  let configStrategies = oThis.ic().configStrategy;
  oThis.unprocessedKeysRetryCount =
    unprocessed_keys_retry_count || configStrategies.storage.maxRetryCount || coreConstants.defaultRetryCount();

  base.call(oThis, 'batchGetItem', params, oThis.serviceType);
};

BatchGetItem.prototype = Object.create(base.prototype);

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
        constantTimeFactor = coreConstants.fixedRetryAfterTime(),
        variableTimeFactor = coreConstants.variableRetryAfterTime(),
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
              'services/dynamodb/batch_get.js:executeDdbRequest, ResourceNotFoundException : attemptNo: ',
              attemptNo
            );
            localResponse.data['UnprocessedKeys'] = batchGetParams['RequestItems'];
          } else {
            return responseHelper.error({
              internal_error_identifier: 's_dy_bw_executeDdbRequest_1',
              api_error_identifier: 'exception',
              debug_options: { error: localResponse.toHash() },
              error_config: coreConstants.ERROR_CONFIG
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
      logger.error('services/dynamodb/batch_get.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_bw_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstants.ERROR_CONFIG
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
          .getInstanceFor(coreConstants.icNameSpace, 'getLibDynamoDBBase')
          .queryDdb(oThis.methodName, oThis.serviceType, batchGetKeys);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(BatchGetItem.prototype, batchGetPrototype);
BatchGetItem.prototype.constructor = batchGetPrototype;

InstanceComposer.registerAsShadowableClass(BatchGetItem, coreConstants.icNameSpace, 'getDDBServiceBatchGetItem');

module.exports = BatchGetItem;
