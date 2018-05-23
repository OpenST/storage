"use strict";

/**
 *
 * This class would be used for adding new shard.<br><br>
 *
 * @module services/shard_management/available_shard/add_shard
 *
 */

const rootPrefix = '../../../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , availableShard = require( rootPrefix + '/lib/models/dynamodb/available_shard')
  , HasShardMultiCacheKlass = require(rootPrefix + '/services/cache_multi_management/has_shard')
  , managedShardConst = require(rootPrefix + '/lib/global_constant/managed_shard')
  , logger            = require( rootPrefix + "/lib/logger/custom_console_logger")
;

/**
 * Constructor to create object of Add Shard
 *
 * @constructor
 *
 * @params {object} params -
 * @param {string} params.ddb_object - dynamoDbObject
 * @param {string} params.shard_name - Shard Name
 * @param {string} params.entity_type - entity type of shard
 *
 * @return {Object}
 *
 */
const AddShard = function (params) {
  const oThis = this;
  logger.debug("=======addShard.params=======");
  logger.debug(params);

  oThis.params = params;
  oThis.shardName = params.shard_name;
  oThis.ddbObject = params.ddb_object;
  oThis.entityType = params.entity_type;
};

AddShard.prototype = {

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
      let r = null;

      r = await oThis.validateParams();
      logger.debug("=======AddShard.validateParams.result=======");
      logger.debug(r);
      if (r.isFailure()) return r;

      r = await availableShard.addShard(oThis.params);
      logger.debug("=======AddShard.addShard.result=======");
      logger.debug(r);

      oThis.clearAnyAssociatedCache();

      return r;
    } catch(err) {
      return responseHelper.error({
        internal_error_identifier:"s_sm_as_as_perform_1",
        api_error_identifier: "exception",
        debug_options: {error: err},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

  },

  /**
   * Validation of params
   *
   * @return {Promise<any>}
   *
   */
  validateParams: function () {
    const oThis = this
      , errorCodePrefix = 's_sm_as_as_validateParams_'
    ;

    return new Promise(async function (onResolve) {
      let errorCode = null
        , params_error_identifier = null
      ;

      if (!oThis.shardName) {
        errorCode = errorCodePrefix + '1';
        params_error_identifier =  "shard_name_mandatory"
      } else if (!oThis.entityType) {
        errorCode = errorCodePrefix + '2';
        params_error_identifier =  "invalid_entity_type"
      } else if (!managedShardConst.getSupportedEntityTypes()[oThis.entityType]) {
        errorCode = errorCodePrefix + '3';
        params_error_identifier =  "invalid_entity_type"
      } else {
        return onResolve(responseHelper.successWithData({}));
      }

      logger.debug(errorCode, params_error_identifier);
      return onResolve(responseHelper.paramValidationError({
        internal_error_identifier: errorCode,
        api_error_identifier: "invalid_api_params",
        params_error_identifiers: [params_error_identifier],
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      }));

    });
  },

  clearAnyAssociatedCache: function () {
    const oThis = this
    ;
    const cacheParams = {
      ddb_object: oThis.ddbObject,
      shard_names: [oThis.shardName]
    };
    return new HasShardMultiCacheKlass(cacheParams).clear();
  }

};

module.exports = AddShard;