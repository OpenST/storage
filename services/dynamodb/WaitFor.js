'use strict';

/**
 * DynamoDB wait for service
 *
 * @module services/dynamodb/WaitFor
 *
 */

const rootPrefix = '../..',
  base = require(rootPrefix + '/services/dynamodb/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

/**
 * Constructor for wait for service class
 * @param {Object} params - Parameters
 * @param {String} waitForMethod - wait for method
 * @param {String} serviceType - type of service supported
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
      validationResponse = base.prototype.validateParams.call(oThis);
    if (validationResponse.isFailure()) return validationResponse;

    if (!oThis.waitForMethod)
      return responseHelper.error({
        internal_error_identifier: 'l_dy_wf_validateParams_1',
        api_error_identifier: 'invalid_wait_for_method',
        debug_options: {},
        error_config: coreConstant.ERROR_CONFIG
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
    const oThis = this;

    try {
      const r = await oThis
        .ic()
        .getInstanceFor(coreConstant.icNameSpace, 'libDynamoDBBase')
        .queryDdb(oThis.methodName, 'raw', oThis.waitForMethod, oThis.params);
      logger.debug('=======Base.perform.result=======');
      logger.debug(r);
      return r;
    } catch (err) {
      logger.error('services/dynamodb/Base.js:executeDdbRequest inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_dy_b_executeDdbRequest_1',
        api_error_identifier: 'exception',
        debug_options: { error: err.message },
        error_config: coreConstant.ERROR_CONFIG
      });
    }
  }
};

Object.assign(WaitFor.prototype, waitForPrototype);
WaitFor.prototype.constructor = waitForPrototype;

InstanceComposer.registerAsShadowableClass(WaitFor, coreConstant.icNameSpace, 'DDBServiceWaitFor');

module.exports = WaitFor;
