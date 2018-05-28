"use strict";

/**
 *
 * This class would be used to assign shard based on id.<br><br>
 *
 * @module services/shard_management/managed_shard/assign_shard
 *
 */

const rootPrefix = '../../../..'
  ,managedShard = require(rootPrefix + '/lib/models/dynamodb/managed_shard')
  , managedShardConst = require(rootPrefix + '/lib/global_constant/managed_shard')
  , GetShardNameMultiCacheKlass = require(rootPrefix + '/services/cache_multi_management/get_shard_details')
  , HasShardMultiCacheKlass = require(rootPrefix + '/services/cache_multi_management/has_shard')
  , availableShard = require(rootPrefix + '/lib/models/dynamodb/available_shard')
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
;

/**
 * Constructor to create object of Assign Shard
 *
 * @constructor
 *
 * @params {Object} params - Parameters
 * @param {Object} params.ddb_object - dynamo db object
 * @param {String} params.identifier - identifier of the shard
 * @param {String} params.entity_type - schema of the table in shard
 * @param {String} params.shard_name - shard name
 * @param {Boolean} params.force_assignment - true/false
 *
 * @return {Object}
 *
 */
const AssignShard = function (params) {
  const oThis = this;
  logger.debug("=======AssignShard.params=======");
  logger.debug(params);
  oThis.params = params;
  oThis.ddbObject = params.ddb_object;
  oThis.identifier = params.identifier;
  oThis.entityType = params.entity_type;
  oThis.shardName = params.shard_name;
  oThis.forceAssignment = params.force_assignment;
};

AssignShard.prototype = {

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
          internal_error_identifier: "s_sm_as_as_perform_1",
          api_error_identifier: "exception",
          debug_options: {message: err.message},
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
    logger.debug("=======AssignShard.validateParams.result=======");
    logger.debug(r);
    if (r.isFailure()) return r;

    r = await managedShard.assignShard(oThis.params);
    logger.debug("=======AssignShard.addShard.result=======");
    logger.debug(r);

    oThis.clearAnyAssociatedCache();

    return r;
  },

  /**
   * Validation of params
   *
   * @return {Promise<any>}
   *
   */
  validateParams: function () {
    const oThis = this
      , errorCodePrefix = 's_sm_ms_as_validateParams_'
    ;

    return new Promise(async function (onResolve) {
      let errorCode = null;
      let error_identifier = null;

      oThis.hasShard = async function () {
        const oThis = this
          , paramsHasShard = {
          ddb_object: oThis.ddbObject,
          shard_names: [oThis.shardName]
        };
        const response = await (new HasShardMultiCacheKlass(paramsHasShard)).fetch();
        if (response.isFailure()) {
          return false;
        }

        return response.data[oThis.shardName].has_shard
      };

      oThis.isAllocatedShard = async function () {
        const oThis = this
          , responseShardInfo = await availableShard.getShardByName(oThis.params)
          , shardInfo = responseShardInfo.data[oThis.shardName]
        ;

        if (responseShardInfo.isFailure() || !shardInfo) {
          throw "assign shard :: validateParams :: getShardByName function failed OR ShardInfo not present"
        }

        let allocationType = shardInfo[String(availableShardConst.ALLOCATION_TYPE)];
        return allocationType === availableShardConst.enabled;
      };

      if (!oThis.identifier) {
        errorCode = errorCodePrefix + '1';
        error_identifier = "invalid_shard_identifier";
      } else if (!(managedShardConst.getSupportedEntityTypes()[oThis.entityType])) {
        errorCode = errorCodePrefix + '2';
        error_identifier = "invalid_entity_type";
      } else if (!oThis.ddbObject) {
        errorCode = errorCodePrefix + '3';
        error_identifier = "invalid_ddb_object";
      } else if (!(await oThis.hasShard())) {
        errorCode = errorCodePrefix + '4';
        error_identifier = "invalid_shard_name";
      } else if (!oThis.forceAssignment && (await oThis.isAllocatedShard())) {
        errorCode = errorCodePrefix + '5';
        error_identifier = "invalid_force_allocation";
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
   * Clear affected cache
   * @return {Promise<*>}
   */
  clearAnyAssociatedCache: async function () {
    const oThis = this
      , cacheParamsGetShard = {
      ddb_object: oThis.ddbObject,
      entity_type: oThis.entityType,
      identifiers: [oThis.identifier]
    };
    return await new GetShardNameMultiCacheKlass(cacheParamsGetShard).clear();
  }
};

module.exports = AssignShard;