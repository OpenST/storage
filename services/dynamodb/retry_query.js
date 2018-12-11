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
 * Constructor for RetryQuery service class
 *
 * @param {Object} params - Parameters
 * @param {String} queryType - Type of Query (PutItem, UpdateItem, DeleteItem, Query, Scan)
 * @param {Number} retryCount - Retry count for ProvisionedThroughputExceededException exception (optional)
 * @param {String} serviceType - type of service supported
 *
 * @constructor
 */
const RetryQuery = function(params, queryType, retryCount, serviceType) {
  const oThis = this;
  oThis.serviceType = serviceType;
  if (retryCount) {
    oThis.attemptToPerformCount = retryCount + 1;
  } else {
    oThis.attemptToPerformCount = 5;
  }
  oThis.queryType = queryType;

  base.call(oThis, oThis.queryType, params, serviceType);
};

RetryQuery.prototype = Object.create(base.prototype);

const retryQueryPrototype = {
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
      let waitTime = 0,
        constantTimeFactor = 25,
        variableTimeFactor = 3,
        response,
        attemptNo = 1;

      while (attemptNo <= oThis.attemptToPerformCount) {
        logger.debug(`dynamodb ${oThis.queryType} attemptNo : ${attemptNo}`);

        response = await oThis.queryAfterWait(oThis.params, waitTime);

        // if success or if error was any other than was ProvisionedThroughputExceededException or ResourceNotFoundException return
        if (response.isSuccess() ||
          //RequestLimitExceeded
          //Internal Server Error (HTTP 500)
          //Service Unavailable (HTTP 503)
          !response.internalErrorCode.includes('ProvisionedThroughputExceededException') ||
          !response.internalErrorCode.includes('ResourceNotFoundException')) {
          return response;
        }

        logger.error(
          `dynamodb ${oThis.queryType} ATTEMPT_FAILED TableName : ${oThis.params.TableName} attemptNo : ${attemptNo}`
        );

        //adjust retry variables
        attemptNo += 1;
        waitTime = constantTimeFactor + variableTimeFactor;
        variableTimeFactor += variableTimeFactor;
      }

      logger.error(
        `dynamodb ${oThis.queryType} ALL_ATTEMPTS_FAILED TableName : ${oThis.params.TableName} attemptToPerformCount : ${
          oThis.attemptToPerformCount
        }`
      );
      return response;
    } catch (err) {
      logger.error('services/dynamodb/retry_query.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_ui_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstants.ERROR_CONFIG
      });
    }
  },

  /**
   * Query DDB after wait time
   *
   * @param {Object} queryParams - Query params
   * @param {Number} waitTime - wait time in milliseconds
   *
   * @return {Promise<any>}
   */
  queryAfterWait: async function(queryParams, waitTime) {
    const oThis = this;

    return new Promise(function(resolve) {
      setTimeout(async function() {
        let r = await oThis
          .ic()
          .getLibDynamoDBBase()
          .queryDdb(oThis.methodName, oThis.serviceType, queryParams);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(RetryQuery.prototype, retryQueryPrototype);
RetryQuery.prototype.constructor = retryQueryPrototype;

InstanceComposer.registerShadowableClass(RetryQuery, 'getDDBServiceRetryQuery');

module.exports = RetryQuery;