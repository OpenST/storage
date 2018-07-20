"use strict";

/**
 * DynamoDB service base class
 *
 * @module services/dynamodb/base
 *
 */

const rootPrefix  = "../.."
  , InstanceComposer = require(rootPrefix + '/instance_composer')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
;

require(rootPrefix+'/lib/dynamodb/base');
require(rootPrefix + "/config/core_constants");

/**
 * Constructor for base service class
 *
 * @param {Object} ddbObject - connection object
 * @param {String} methodName - DDB method name
 * @param {Object} params - DDB method params
 *
 * @constructor
 */
const Base = function(methodName, params, serviceType) {
  const oThis = this
  ;

  oThis.params = params;
  oThis.methodName = methodName;
  oThis.serviceType = serviceType;
};

Base.prototype = {

  /**
   * Perform method
   *
   * @return {promise<result>}
   *
   */
  perform: async function () {
    const oThis = this
      , coreConstants = oThis.ic().getCoreConstants()
    ;
    return oThis.asyncPerform()
      .catch(function (err) {
      logger.error("services/dynamodb/base.js:perform inside catch ", err);
      return responseHelper.error({
        internal_error_identifier: "s_dy_b_perform_1",
        api_error_identifier: "exception",
        debug_options: {error: err.stack},
        error_config: coreConstants.ERROR_CONFIG
      });
    });
  },

  /**
   * Async Perform
   *
   * @return {Promise<*>}
   */
  asyncPerform: function() {
    const oThis = this
    ;

    let r = null;
    r = oThis.validateParams();
    logger.debug("=======Base.validateParams.result=======");
    logger.debug(r);
    if (r.isFailure()) return r;

    r = oThis.executeDdbRequest();
    logger.debug("=======Base.executeDdbRequest.result=======");
    logger.debug(r);
    return r;

  },

  /**
   * Validation of params
   *
   * @return {result}
   *
   */
  validateParams: function () {
    const oThis = this
      , coreConstants = oThis.ic().getCoreConstants()
    ;

    if (!oThis.methodName) {
      return responseHelper.error({
        internal_error_identifier:"l_dy_b_validateParams_1",
        api_error_identifier: "invalid_method_name",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    if (!oThis.params) {
      return responseHelper.error({
        internal_error_identifier:"l_dy_b_validateParams_3",
        api_error_identifier: "invalid_params",
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
  executeDdbRequest: async function () {
    const oThis = this
    ;
    // Last parameter is service type (dax or dynamoDB)
    return await oThis.ic().getLibDynamoDBBase().queryDdb(oThis.methodName, oThis.params, oThis.serviceType);
  },

};

InstanceComposer.registerShadowableClass(Base, 'getDDBServiceBaseKlass');

module.exports = Base;