'use strict';

/**
 * DynamoDB Batch Write with retry count
 *
 * @module services/dynamodb/batch_write
 *
 */

const rootPrefix = '../..',
  base = require(rootPrefix + '/services/dynamodb/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

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
    let configStrategies = oThis.ic().configStrategy;
    oThis.attemptToPerformCount = configStrategies.storage.maxRetryCount || coreConstants.defaultRetryCount();
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
    const oThis = this;

    try {
      let waitTime = 0,
        constantTimeFactor = coreConstants.fixedRetryAfterTime(),
        variableTimeFactor = coreConstants.variableRetryAfterTime(),
        response,
        attemptNo = 1;

      while (attemptNo <= oThis.attemptToPerformCount) {
        logger.debug(`dynamodb ${oThis.queryType} attemptNo : ${attemptNo}`);

        response = await oThis.queryAfterWait(oThis.params, waitTime);

        // if success or if error was any other than was ResourceNotFoundException return
        // NOTE: Except batch requests, all other retries are already handled by AWS SDK
        if (response.isSuccess() || !response.internalErrorCode.includes('ResourceNotFoundException')) {
          return response;
        }

        logger.warn(
          'DynamoDB ATTEMPT_FAILED TableName: ',
          oThis.params.TableName,
          'Query Type: ',
          oThis.queryType,
          'attemptNo: ',
          attemptNo
        );

        //adjust retry variables
        attemptNo += 1;
        waitTime = constantTimeFactor + variableTimeFactor;
        variableTimeFactor += variableTimeFactor;
      }

      logger.error(
        'DynamoDB ALL_ATTEMPTS_FAILED TableName: ',
        oThis.params.TableName,
        'Query Type: ',
        oThis.queryType,
        'attemptToPerformCount: ',
        oThis.attemptToPerformCount
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
          .getInstanceFor(coreConstants.icNameSpace, 'getLibDynamoDBBase')
          .queryDdb(oThis.methodName, oThis.serviceType, queryParams);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(RetryQuery.prototype, retryQueryPrototype);
RetryQuery.prototype.constructor = retryQueryPrototype;

InstanceComposer.registerAsShadowableClass(RetryQuery, coreConstants.icNameSpace, 'getDDBServiceRetryQuery');

module.exports = RetryQuery;
