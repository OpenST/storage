'use strict';

/**
 * AutoScale service base class
 *
 * @module services/auto_scale/base
 *
 */
const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  OSTBase = require('@ostdotcom/base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/auto_scale/base');

/**
 * Constructor for base service class
 *
 * @param {string} methodName - AutoScale method name
 * @param {object} params - AutoScale method params
 *
 * @constructor
 */
const Base = function(methodName, params) {
  const oThis = this;
  logger.debug('=======AutoScale.Base.params=======');
  logger.debug('\nmethodName: ' + methodName, '\nparams: ' + params);
  oThis.params = params;
  oThis.methodName = methodName;
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
      logger.error('services/auto_scale/base.js:perform inside catch ', err);
      return responseHelper.error({
        internal_error_identifier: 's_as_b_perform_1',
        api_error_identifier: 'exception',
        debug_options: { message: err.message },
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
    logger.debug('=======AutoScale.Base.validateParams.result=======');
    logger.debug(r);
    if (r.isFailure()) return r;

    r = oThis.executeAutoScaleRequest();
    logger.debug('=======AutoScale.Base.executeAutoScaleRequest.result=======');
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

    // validate if the method is available
    if (!oThis.methodName)
      return responseHelper.error({
        internal_error_identifier: 'l_as_b_validateParams_1',
        api_error_identifier: 'invalid_method_name',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });

    if (!oThis.params)
      return responseHelper.error({
        internal_error_identifier: 'l_as_b_validateParams_3',
        api_error_identifier: 'invalid_params',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });

    return responseHelper.successWithData({});
  },

  /**
   * Execute AutoScale request
   *
   * @return {promise<result>}
   *
   */
  executeAutoScaleRequest: async function() {
    const oThis = this,
      ASBase = oThis.ic().getShadowedClassFor(coreConstants.icNameSpace, 'getLibAutoScaleBase'),
      autoScaleObject = new ASBase(),
      r = await autoScaleObject.call(oThis.methodName, oThis.params);

    logger.debug('=======Base.perform.result=======');
    logger.debug(r);
    return r;
  }
};

InstanceComposer.registerAsShadowableClass(Base, coreConstants.icNameSpace, 'getServicesAutoScaleBase');

module.exports = Base;
