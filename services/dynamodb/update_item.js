"use strict";

/**
 * DynamoDB Batch Write with retry count
 *
 * @module services/dynamodb/batch_write
 *
 */

const rootPrefix = "../.."
  , base = require(rootPrefix + "/services/dynamodb/base")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
;


/**
 * Constructor for updateItem service class
 *
 * @param {Object} ddbObject - DynamoDB Object
 * @param {Object} params - Parameters
 * @param {Integer} retryCount - Retry count for ProvisionedThroughputExceededException exception (optional)
 *
 * @constructor
 */
const UpdateItem = function (ddbObject, params, retryCount) {

  const oThis = this
  ;

  if (retryCount) {
    oThis.attemptToPerformCount = retryCount + 1;
  } else {
    oThis.attemptToPerformCount = 1;
  }

  base.call(oThis, ddbObject, 'updateItem', params);

};

UpdateItem.prototype = Object.create(base.prototype);

const updateItemPrototype = {

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
      let waitTime = 0
        , constantTimeFactor = 25
        , variableTimeFactor = 3
        , response
        , attemptNo = 1
      ;

      while (attemptNo <= oThis.attemptToPerformCount) {

        logger.debug('updateItem attemptNo ', attemptNo);

        response = await oThis.updateItemAfterWait( oThis.params, waitTime);

        // if success or if error was any other than was ProvisionedThroughputExceededException return
        if (response.isSuccess() || !response.internalErrorCode.includes('ProvisionedThroughputExceededException')) {
          return response;
        }

        logger.error(`dynamodb UPDATE_ITEM ATTEMPT_FAILED TableName : ${oThis.params.TableName} attemptNo : ${attemptNo}`);

        //adjust retry variables
        attemptNo += 1;
        waitTime = constantTimeFactor + variableTimeFactor;
        variableTimeFactor += variableTimeFactor;

      }

      logger.error(`dynamodb UPDATE_ITEM ALL_ATTEMPTS_FAILED TableName : ${oThis.params.TableName} attemptToPerformCount : ${oThis.attemptToPerformCount}`);
      return response;

    } catch (err) {
      logger.error("services/dynamodb/update_item.js:executeDdbRequest inside catch ", err);
      return responseHelper.error({
        internal_error_identifier: "s_dy_ui_executeDdbRequest_1",
        api_error_identifier: "exception",
        debug_options: {error: err.message},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

  },

  /**
   * Update Item after wait time
   *
   * @param {Object} updateItemParams - Update Item params
   * @param {Integer} waitTime - wait time in milliseconds
   *
   * @return {Promise<any>}
   */
  updateItemAfterWait: async function (updateItemParams, waitTime) {
    const oThis = this
    ;

    return new Promise(function (resolve) {
      setTimeout(async function () {
        let r = await oThis.ddbObject.call(oThis.methodName, updateItemParams);
        resolve(r);
      }, waitTime);
    });
  }

};

Object.assign(UpdateItem.prototype, updateItemPrototype);
UpdateItem.prototype.constructor = updateItemPrototype;
module.exports = UpdateItem;