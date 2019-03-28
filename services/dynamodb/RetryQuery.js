'use strict';

const rootPrefix = '../..',
  base = require(rootPrefix + '/services/dynamodb/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

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
const DDBServiceRetryQuery = function(params, queryType, retryCount, serviceType) {
  const oThis = this;
  oThis.serviceType = serviceType;
  if (retryCount) {
    oThis.attemptToPerformCount = retryCount + 1;
  } else {
    let configStrategies = oThis.ic().configStrategy;
    oThis.attemptToPerformCount = configStrategies.storage.maxRetryCount || coreConstant.defaultRetryCount();
  }
  oThis.queryType = queryType;

  base.call(oThis, oThis.queryType, params, serviceType);
};

DDBServiceRetryQuery.prototype = Object.create(base.prototype);

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
        constantTimeFactor = coreConstant.fixedRetryAfterTime(),
        variableTimeFactor = coreConstant.variableRetryAfterTime(),
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
        waitTime = constantTimeFactor + attemptNo * variableTimeFactor;
        attemptNo += 1;
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
      logger.error('services/dynamodb/RetryQuery.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_ui_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstant.ERROR_CONFIG
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
          .getInstanceFor(coreConstant.icNameSpace, 'libDynamoDBBase')
          .queryDdb(oThis.methodName, oThis.serviceType, queryParams);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(DDBServiceRetryQuery.prototype, retryQueryPrototype);
DDBServiceRetryQuery.prototype.constructor = retryQueryPrototype;

InstanceComposer.registerAsShadowableClass(DDBServiceRetryQuery, coreConstant.icNameSpace, 'DDBServiceRetryQuery');

module.exports = DDBServiceRetryQuery;
