"use strict";

/**
 *
 * This class would be used to configure existing available shard.<br><br>
 *
 * @module services/shard_management/available_shard/configure_shard
 *
 */

const rootPrefix = '../../../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , availableShard = require( rootPrefix + '/lib/models/dynamodb/available_shard')
  , GetShardListMultiCacheKlass = require(rootPrefix + '/services/cache_multi_management/get_shard_list')
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , HasShardMultiCacheKlass = require(rootPrefix + '/services/cache_multi_management/has_shard')
  , logger            = require( rootPrefix + "/lib/logger/custom_console_logger")
;

/**
 * Constructor to create object of Configure Shard
 *
 * @constructor
 *
 * @params {Object} params - Parameters
 * @param {String} params.ddb_object - dynamoDbObject
 * @param {String} params.shard_name - Name of the shard
 * @param {String} params.allocation_type - enable or disable allocation. enabled/disabled
 *
 * @return {Object}
 *
 */
const ConfigureShard = function (params) {
  const oThis = this;
  params = params || {};
  logger.debug("=======ConfigureShard.params=======");
  logger.debug(params);

  oThis.params = params;
  oThis.ddbObject = params.ddb_object;
  oThis.shardName = params.shard_name;
  oThis.allocationType = params.allocation_type;
};

ConfigureShard.prototype = {

  /**
   * Perform method
   *
   * @return {promise<result>}
   *
   */
  perform: async function () {
    const oThis = this
    ;

    return oThis.asyncPerform()
      .catch(function(err){
      return responseHelper.error({
        internal_error_identifier:"s_sm_as_cs_perform_1",
        api_error_identifier: "exception",
        debug_options: {error: err},
        error_config: coreConstants.ERROR_CONFIG
      });
    });
  },

  /**
   * Async Perform
   *
   * @return {Promise<*>}
   */
  asyncPerform: async function () {
    const oThis = this
    ;

    let r = null;

    r = await oThis.validateParams();
    logger.debug("=======ConfigureShard.validateParams.result=======");
    logger.debug(r);
    if (r.isFailure()) return r;

    if ((await oThis.isRedundantUpdate())) {
      logger.debug("ConfigureShard :: is redundant update");
    } else {
      r = await availableShard.configureShard(oThis.params);
      logger.debug("=======ConfigureShard.configureShard.result=======");
      logger.debug(r);
      oThis.clearAnyAssociatedCache();
      if (r.isFailure()) return r;
    }
    return responseHelper.successWithData({});
  },

  /**
   * Validation of params
   *
   * @return {Promise<any>}
   *
   */
  validateParams: function () {
    const oThis = this
      , errorCodePrefix = 's_sm_as_cs_validateParams_'
    ;

    return new Promise(async function (onResolve) {
      let errorCode = null
        , errorMsg = null
        , error_identifier = null
      ;

      oThis.hasShard = async function() {
        const paramsHasShard = {
          ddb_object: oThis.ddbObject,
          shard_names: [oThis.shardName]
        };
        const response  = await (new HasShardMultiCacheKlass(paramsHasShard)).fetch();
        if (response.isFailure()){
          return false;
        }

        return response.data[oThis.shardName].has_shard
      };

      if (!oThis.shardName) {
        errorCode = errorCodePrefix + '1';
        error_identifier = "invalid_shard_name";
      } else if (String(typeof(oThis.allocationType)) !== 'string') {
        errorCode = errorCodePrefix + '2';
        error_identifier = "invalid_allocation_type";
      } else if (undefined === availableShardConst.ALLOCATION_TYPES[oThis.allocationType]) {
        errorCode = errorCodePrefix + '3';
        error_identifier = "invalid_allocation_type";
      } else if (!(await oThis.hasShard())) {
        errorCode = errorCodePrefix + '4';
        errorMsg = 'shardName does not exists';
        error_identifier = "invalid_shard_name";
      } else {
        return onResolve(responseHelper.successWithData({}));
      }

      logger.debug(errorCode, error_identifier);
      return onResolve(responseHelper.error({
        internal_error_identifier: errorCode,
        api_error_identifier: error_identifier,
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      }));
    });
  },

  /**
   * Check whether update services is trying to change attribute which is already as expected.
   *
   * @return {Promise<boolean>}
   */
  isRedundantUpdate : async function() {
    const oThis = this
      , responseShardInfo = await availableShard.getShardByName(oThis.params)
      , shardInfo = responseShardInfo.data[oThis.shardName]
    ;

    if (responseShardInfo.isFailure() || !shardInfo) {
      throw "configure_shard :: validateParams :: getShardByName function failed OR ShardInfo not present"
    }

    oThis.oldEntityType = shardInfo[availableShardConst.ENTITY_TYPE];
    oThis.oldAllocationType = shardInfo[String(availableShardConst.ALLOCATION_TYPE)];

    return oThis.oldAllocationType === oThis.allocationType;
  },

  /**
   * Clears any Cache associated with "this" object entity type
   *
   * @return {Promise<*>}
   */
  clearAnyAssociatedCache: async function() {
    const oThis = this
    ;

    logger.debug("=======ConfigureShard.cacheClearance.result=======");
    const cacheParams = {
      ddb_object: oThis.ddbObject,
      ids: [{
        entity_type: oThis.oldEntityType,
        shard_type: oThis.allocationType}, {
        entity_type: oThis.oldEntityType,
        shard_type: oThis.oldAllocationType
      }]
    };

    return new GetShardListMultiCacheKlass(cacheParams).clear();
  }
};

module.exports = ConfigureShard;