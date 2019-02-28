'use strict';

/**
 * DynamoDB service base class
 *
 * @module services/dynamodb/base
 *
 */

const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  OSTBase = require('@ostdotcom/base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/dynamodb/base');

/**
 * Constructor for base service class
 *
 * @param {String} methodName - DDB method name
 * @param {Object} params - DDB method params
 * @param {String} serviceType - type of service supported
 *
 * @constructor
 */
const Base = function(methodName, params, serviceType) {
  const oThis = this;

  oThis.params = params;
  oThis.methodName = methodName;
  oThis.serviceType = serviceType;
};

Base.prototype = {
  /**
   * Perform method
   *
   * @return {Promise<result>}
   *
   */
  perform: async function() {
    const oThis = this;

    return oThis.asyncPerform().catch(function(err) {
      logger.error('services/dynamodb/base.js:perform inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_b_perform_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.stack },
        error_config: coreConstants.ERROR_CONFIG
      });
    });
  },

  /**
   * Async Perform
   *
   * @return {Promise<*>}
   */
  asyncPerform: async function() {
    const oThis = this;

    let r = oThis.validateParams();
    logger.debug('=======Base.validateParams.result=======');
    logger.debug(r);
    if (r.isFailure()) return r;

    r = await oThis.executeDdbRequest();
    logger.debug('=======Base.executeDdbRequest.result=======');
    logger.debug(r);
    return r;
  },

  /**
   * Validation of params
   *
   * @return {result}
   *
   */
  validateParams: function() {
    const oThis = this;

    if (!oThis.methodName) {
      return responseHelper.error({
        internal_error_identifier: 'l_dy_b_validateParams_1',
        api_error_identifier: 'invalid_method_name',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    if (!oThis.params) {
      return responseHelper.error({
        internal_error_identifier: 'l_dy_b_validateParams_3',
        api_error_identifier: 'invalid_params',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

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
    // Last parameter is service type (dax or dynamoDB)
    return await oThis
      .ic()
      .getInstanceFor(coreConstants.icNameSpace, 'getLibDynamoDBBase')
      .queryDdb(oThis.methodName, oThis.serviceType, oThis.params);
  }
};

InstanceComposer.registerAsShadowableClass(Base, coreConstants.icNameSpace, 'getDDBServiceBaseKlass');

module.exports = Base;
