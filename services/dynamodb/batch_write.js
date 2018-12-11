'use strict';

/**
 * DynamoDB Batch Write with retry count
 *
 * @module services/dynamodb/batch_write
 *
 */

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  base = require(rootPrefix + '/services/dynamodb/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

require(rootPrefix + '/config/core_constants');

/**
 * Constructor for batch write item service class
 * @param {Object} params - Parameters
 * @param {Integer} unprocessed_items_retry_count - retry count for unprocessed items (optional)
 * @param {String} serviceType - type of service supported
 *
 * @constructor
 */
const BatchWriteItem = function(params, unprocessed_items_retry_count, serviceType) {
  const oThis = this;
  oThis.serviceType = serviceType;
  oThis.unprocessedItemsRetryCount = unprocessed_items_retry_count || 0;

  base.call(oThis, 'batchWriteItem', params, oThis.serviceType);
};

BatchWriteItem.prototype = Object.create(base.prototype);

const batchWritePrototype = {
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
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants();

    try {
      let batchWriteParams = oThis.params,
        waitTime = 0,
        constantTimeFactor = 90,
        variableTimeFactor = 10,
        response,
        attemptNo = 1,
        unprocessedItems,
        unprocessedItemsLength;

      while (true) {
        logger.debug('executeDdbRequest attemptNo ', attemptNo);

        response = await oThis.batchWriteItemAfterWait(batchWriteParams, waitTime);

        if (!response.isSuccess()) {
          logger.error('services/dynamodb/batch_write.js:executeDdbRequest, attemptNo: ', attemptNo, response.toHash());
          return responseHelper.error({
            internal_error_identifier: 's_dy_bw_executeDdbRequest_1',
            api_error_identifier: 'exception',
            debug_options: { error: response.toHash() },
            error_config: coreConstants.ERROR_CONFIG
          });
        }

        unprocessedItems = response.data['UnprocessedItems'];
        unprocessedItemsLength = 0;

        for (let tableName in unprocessedItems) {
          if (unprocessedItems.hasOwnProperty(tableName)) {
            unprocessedItemsLength += unprocessedItems[tableName].length;
            logger.warn(
              'DynamoDB BATCH_WRITE ATTEMPT_FAILED TableName :',
              tableName,
              ' unprocessedItemsCount: ',
              unprocessedItemsLength,
              ' items count: ',
              batchWriteParams.RequestItems[tableName].length,
              ' attemptNo ',
              attemptNo
            );
            if (oThis.unprocessedItemsRetryCount) {
              logger.info('Retry will be attempted.');
            }
          }
        }

        // Break the loop if unprocessedItems get empty or retry count exceeds the given limit
        if (unprocessedItemsLength === 0 || oThis.unprocessedItemsRetryCount === 0) {
          break;
        }

        //Create new batchWriteParams of unprocessedItems
        batchWriteParams = { RequestItems: unprocessedItems };

        //adjust retry variables
        attemptNo += 1;
        waitTime = constantTimeFactor + variableTimeFactor;
        variableTimeFactor += variableTimeFactor;
        oThis.unprocessedItemsRetryCount -= 1;
      }

      for (let tableName in unprocessedItems) {
        if (unprocessedItems.hasOwnProperty(tableName)) {
          logger.error(
            'DynamoDB BATCH_WRITE ALL_ATTEMPTS_FAILED TableName :',
            tableName,
            ' unprocessedItemsCount: ',
            unprocessedItemsLength,
            ' attempts Failed ',
            attemptNo
          );
        }
      }

      logger.debug('=======Base.perform.result=======');
      logger.debug(response);
      return response;
    } catch (err) {
      logger.error('services/dynamodb/batch_write.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_bw_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstants.ERROR_CONFIG
      });
    }
  },

  /**
   * Batch write Item with wait time
   * @param {Object} batchWriteParams - Batch write params
   * @param {Integer} waitTime - wait time in milliseconds
   * @return {Promise<any>}
   */
  batchWriteItemAfterWait: async function(batchWriteParams, waitTime) {
    const oThis = this;

    return new Promise(function(resolve) {
      setTimeout(async function() {
        let r = await oThis
          .ic()
          .getLibDynamoDBBase()
          .queryDdb(oThis.methodName, oThis.serviceType, batchWriteParams);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(BatchWriteItem.prototype, batchWritePrototype);
BatchWriteItem.prototype.constructor = batchWritePrototype;

InstanceComposer.registerShadowableClass(BatchWriteItem, 'getDDBServiceBatchWriteItem');

module.exports = BatchWriteItem;
