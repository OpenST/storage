"use strict";

/**
 * DynamoDB wait for service
 *
 * @module services/dynamodb/wait_for
 *
 */

const rootPrefix = "../.."
  , base = require(rootPrefix + "/services/dynamodb/base")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
;


/**
 * Constructor for batch write item service class
 * @param {Object} ddbObject - DynamoDB Object
 * @param {Object} params - Parameters
 * @param {Integer} unprocessed_items_retry_count - retry count for unprocessed items (optional)
 *
 * @constructor
 */
const BatchWriteItem = function (ddbObject, params, unprocessed_items_retry_count) {
  const oThis = this
  ;
  oThis.unprocessedItemRetryCount = unprocessed_items_retry_count || 0;

  base.call(oThis, ddbObject, 'batchWriteItem', params);
};

BatchWriteItem.prototype = Object.create(base.prototype);

const batchWritePrototype = {

  /**
   * Validation of params
   *
   * @return {*}
   */
  validateParams: function () {

    const oThis = this
      , validationResponse = base.prototype.validateParams.call(oThis)
    ;
    if (validationResponse.isFailure()) return validationResponse;

    return responseHelper.successWithData({});
  },

  /**
   * Execute dynamoDB request
   *
   * @return {promise<result>}
   *
   */
  executeDdbRequest: async function () {
    const oThis = this
    ;

    try {
      let batchWriteParams = oThis.params
        , waitTime = 0
        , timeFactor = 300
        , r = null
        , attemptNo = 1
        , unprocessedItems
        , unprocessedItemsLength
      ;

      while(true) {

        logger.info('executeDdbRequest attempNo ', attemptNo);

        r = await oThis.batchWriteItemAfterWait(batchWriteParams, waitTime);

        if (!r.isSuccess()) {
          logger.error("services/dynamodb/batch_write.js:executeDdbRequest, attemptNo: ", attemptNo, r.toHash());
          return responseHelper.error({
            internal_error_identifier: "s_dy_bw_executeDdbRequest_1",
            api_error_identifier: "exception",
            debug_options: {error: err.message},
            error_config: coreConstants.ERROR_CONFIG
          });
        }

        unprocessedItems = r.data['UnprocessedItems'];
        unprocessedItemsLength = 0;


        // Break the loop if unprocessedItem get empty or retry count exceeds
        if (unprocessedItemsLength === 0 || oThis.unprocessedItemRetryCount === 0) {
            break;
        }

        for (let shardName in unprocessedItems) {
          if (unprocessedItems.hasOwnProperty(shardName)) {
            unprocessedItemsLength += unprocessedItems[shardName].length;
            logger.error('batch_write executeDdbRequest TableName :', shardName,
              ' unprocessedItemsCount: ', unprocessedItemsLength,
              ' attemptNo ', attemptNo);
          }
        }

        batchWriteParams = {RequestItems: unprocessedItems};

        waitTime += timeFactor;
        oThis.unprocessedItemRetryCount -= 1;
        attemptNo += 1;
      }

      for (let shardName in unprocessedItems) {
        if (unprocessedItems.hasOwnProperty(shardName)) {
          logger.error('BATCH_WRITE ALL_ATTEMPTS_FAILED TableName :', shardName,
            ' unprocessedItemsCount: ', unprocessedItemsLength,
            ' attempts Failed ', attemptNo);
        }
      }

      logger.debug("=======Base.perform.result=======");
      logger.debug(r);
      return r;

    } catch (err) {
      logger.error("services/dynamodb/batch_write.js:executeDdbRequest inside catch ", err);
      return responseHelper.error({
        internal_error_identifier: "s_dy_bw_executeDdbRequest_1",
        api_error_identifier: "exception",
        debug_options: {error: err.message},
        error_config: coreConstants.ERROR_CONFIG
      });
    }
  },

  /**
   * Batch write Item with wait time
   * @param batchWriteParams
   * @param waitTime
   * @return {Promise<any>}
   */
  batchWriteItemAfterWait: async function (batchWriteParams, waitTime) {
    const oThis = this
    ;

    return new Promise(function (resolve) {
      setTimeout(async function () {
        let r = await oThis.ddbObject.call(oThis.methodName, batchWriteParams);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(BatchWriteItem.prototype, batchWritePrototype);
BatchWriteItem.prototype.constructor = batchWritePrototype;
module.exports = BatchWriteItem;