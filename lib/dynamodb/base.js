"use strict";

/**
 * DynamoDB Libraries Base class
 *
 * @module lib/dynamodb/base
 *
 */

//Load external files
require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk');
AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

const rootPrefix = '../..'
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , dynamoFactory = require(rootPrefix + '/config/dynamo')
;
/**
 * Constructor for base class
 *
 * @params {Object} params - DynamoDB configurations params
 *
 * @constructor
 */
const Base = function (params) {
  const oThis = this;

  // Set Default DDB params if not passed
  oThis.connectionStratgies = params;
};

Base.prototype = {

  /**
   * Query on DynamoDB .
   *
   * @param methodName
   * @param params
   * @returns {Promise<*|Promise<result>>}
   */

  queryDdb: async function(methodName, ...params) {
    const oThis = this;
    // Last parameter is the serviceType passed from every method.
    let serviceType = params.splice(-1, 1); // Removes the last element from the params and modifies params.
    const dbInstance = await dynamoFactory.getProvider(oThis.connectionStratgies, serviceType);
    return oThis.call(dbInstance, methodName, params);
  },


  /**
   * Call dynamoDB methods
   *
   * @params {String} method - method name
   * @params {object} params - Parameters
   *
   * @return {Promise<result>}
   *
   */

  call: function (dbInstance, method, methodArgs) {
    const oThis = this
      , methodRef  = dbInstance[method]
    ;
    //console.log('-----methodRef', methodRef);
    // return promise
    return new Promise(function (onResolve, onReject) {
      try {

        // validate if the DB instance is available
        if (!dbInstance) return onResolve(responseHelper.error({
          internal_error_identifier:"l_dy_b_call_1",
          api_error_identifier: "invalid_db_instance",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        }));

        // validate if the method is available
        if (!methodRef) return onResolve(responseHelper.error({
          internal_error_identifier:"l_dy_b_call_2",
          api_error_identifier: "invalid_method_ref",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        }));

        methodArgs.push(function (err, data) {
          if (err) {
            logger.error("Error from DDB - ", err);
            return onResolve(responseHelper.error({
              internal_error_identifier: `l_dy_b_call_3:${err.code}`,
              api_error_identifier: "ddb_method_call_error",
              debug_options: err,
              error_config: coreConstants.ERROR_CONFIG
            }));
          }
          else {
            logger.debug(data); // successful response
            return onResolve(responseHelper.successWithData(data));
          }
        });

        methodRef.apply(dbInstance, methodArgs);
      } catch(err) {
        logger.error("lib/dynamodb/base.js:call inside catch ", err);
        return onResolve(responseHelper.error({
          internal_error_identifier:"l_dy_b_call_4",
          api_error_identifier: "exception",
          debug_options: {error: err.stack},
          error_config: coreConstants.ERROR_CONFIG
        }));

      }

    });
  }
};

module.exports = Base;