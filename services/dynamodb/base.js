"use strict";

/**
 * DynamoDB service base class
 *
 * @module services/dynamodb/base
 *
 */

const rootPrefix  = "../.."
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
;

/**
 * Constructor for base service class
 *
 * @param {object} ddbObject - connection object
 * @param {string} methodName - DDB method name
 * @param {object} params - DDB method params
 *
 * @constructor
 */
const Base = function(ddbObject, methodName, params) {
  const oThis = this
  ;

  oThis.params = params;
  oThis.ddbObject = ddbObject;
  oThis.methodName = methodName;
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
    ;
    try {
      var r = null;
      r = oThis.validateParams();
      logger.debug("=======Base.validateParams.result=======");
      logger.debug(r);
      if (r.isFailure()) return r;

      r = oThis.executeDdbRequest();
      logger.debug("=======Base.executeDdbRequest.result=======");
      logger.debug(r);
      return r;

    } catch(err) {
      logger.error("services/dynamodb/base.js:perform inside catch ", err);
      return responseHelper.error({
        internal_error_identifier:"s_dy_b_perform_1",
        api_error_identifier: "exception",
        debug_options: {error: err.stack},
        error_config: coreConstants.ERROR_CONFIG
      });
    }
  },

  /**
   * Validation of params
   *
   * @return {result}
   *
   */
  validateParams: function () {
    const oThis = this;

    if (!oThis.methodName) {
      return responseHelper.error({
        internal_error_identifier:"l_dy_b_validateParams_1",
        api_error_identifier: "invalid_method_name",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    if (!oThis.ddbObject){
      return responseHelper.error({
        internal_error_identifier:"l_dy_b_validateParams_2",
        api_error_identifier: "invalid_ddb_object",
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
    return await oThis.ddbObject.call(oThis.methodName, oThis.params);
  },

};

module.exports = Base;