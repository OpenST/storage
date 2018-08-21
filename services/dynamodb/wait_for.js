'use strict';

/**
 * DynamoDB wait for service
 *
 * @module services/dynamodb/wait_for
 *
 */

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  base = require(rootPrefix + '/services/dynamodb/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

require(rootPrefix + '/config/core_constants');

/**
 * Constructor for wait for service class
 * @param {Object} params - Parameters
 * @param {String} waitForMethod - wait for method
 *
 * @constructor
 */
const WaitFor = function(waitForMethod, params, serviceType) {
  const oThis = this;
  oThis.waitForMethod = waitForMethod;
  base.call(oThis, 'waitFor', params, serviceType);
};

WaitFor.prototype = Object.create(base.prototype);

const waitForPrototype = {
  /**
   * Validation of params
   *
   * @return {*}
   */
  validateParams: function() {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants(),
      validationResponse = base.prototype.validateParams.call(oThis);
    if (validationResponse.isFailure()) return validationResponse;

    if (!oThis.waitForMethod)
      return responseHelper.error({
        internal_error_identifier: 'l_dy_wf_validateParams_1',
        api_error_identifier: 'invalid_wait_for_method',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });

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
      const r = await oThis
        .ic()
        .getLibDynamoDBBase()
        .queryDdb(oThis.methodName, 'raw', oThis.waitForMethod, oThis.params);
      logger.debug('=======Base.perform.result=======');
      logger.debug(r);
      return r;
    } catch (err) {
      logger.error('services/dynamodb/base.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_b_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstants.ERROR_CONFIG
      });
    }
  }
};

Object.assign(WaitFor.prototype, waitForPrototype);
WaitFor.prototype.constructor = waitForPrototype;

InstanceComposer.registerShadowableClass(WaitFor, 'getDDBServiceWaitFor');

module.exports = WaitFor;
