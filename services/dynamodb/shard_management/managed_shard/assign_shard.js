'use strict';

/**
 *
 * This class would be used to assign shard based on id.<br><br>
 *
 * @module services/shard_management/managed_shard/assign_shard
 *
 */

const rootPrefix = '../../../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  coreConstants = require(rootPrefix + '/config/core_constants'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

require(rootPrefix + '/lib/models/dynamodb/shard_management/managed_shard');
require(rootPrefix + '/services/cache_multi_management/get_shard_details');
require(rootPrefix + '/services/cache_multi_management/has_shard');
require(rootPrefix + '/lib/models/dynamodb/shard_management/available_shard');
require(rootPrefix + '/lib/global_constant/available_shard');
require(rootPrefix + '/config/core_constants');

/**
 * Constructor to create object of Assign Shard
 *
 * @constructor
 *
 * @params {Object} params - Parameters
 * @param {String} params.identifier - identifier of the shard
 * @param {String} params.entity_type - schema of the table in shard
 * @param {String} params.shard_name - shard name
 * @param {Boolean} params.force_assignment - optional true/false
 *
 * @return {Object}
 *
 */
const AssignShard = function(params) {
  const oThis = this;
  logger.debug('=======AssignShard.params=======');
  logger.debug(params);
  oThis.params = params;
  oThis.identifier = params.identifier;
  oThis.entityType = params.entity_type;
  oThis.shardName = params.shard_name;
  oThis.forceAssignment = params.force_assignment || false;
};

AssignShard.prototype = {
  /**
   * Perform method
   *
   * @return {promise<result>}
   *
   */
  perform: async function() {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants();

    return oThis.asyncPerform().catch(function(err) {
      return responseHelper.error({
        internal_error_identifier: 's_sm_as_as_perform_1',
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
    const oThis = this,
      managedShard = oThis.ic().getLibModelsManagedShard();

    let r = null;

    r = await oThis.validateParams();
    logger.debug('=======AssignShard.validateParams.result=======');
    logger.debug(r);
    if (r.isFailure()) return r;

    r = await managedShard.assignShard(oThis.params);
    logger.debug('=======AssignShard.addShard.result=======');
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
  validateParams: function() {
    const oThis = this,
      errorCodePrefix = 's_sm_ms_as_validateParams_';

    return new Promise(async function(onResolve) {
      let errorCode = null;
      let error_identifier = null;

      oThis.hasShard = async function() {
        const oThis = this,
          HasShardMultiCacheKlass = oThis.ic().getDDBServiceHasShardKlass(),
          paramsHasShard = {
            shard_names: [oThis.shardName]
          };
        const response = await new HasShardMultiCacheKlass(paramsHasShard).fetch();
        if (response.isFailure()) {
          return false;
        }

        return response.data[oThis.shardName].has_shard;
      };

      // Shared shard i.e. enabled for allocation
      oThis.isSharedShard = async function() {
        const oThis = this,
          availableShard = oThis.ic().getDDBServiceAvailableShard(),
          responseShardInfo = await availableShard.getShardByName(oThis.params),
          shardInfo = responseShardInfo.data[oThis.shardName],
          availableShardConst = oThis.ic().getLibAvailableShard();

        if (responseShardInfo.isFailure() || !shardInfo) {
          throw 'assign shard :: validateParams :: getShardByName function failed OR ShardInfo not present';
        }

        let allocationType = shardInfo[String(availableShardConst.ALLOCATION_TYPE)];
        return allocationType === availableShardConst.enabled;
      };

      if (!oThis.identifier) {
        errorCode = errorCodePrefix + '1';
        error_identifier = 'invalid_shard_identifier';
      } else if (!(await oThis.hasShard())) {
        errorCode = errorCodePrefix + '3';
        error_identifier = 'invalid_shard_name';
      } else if (!(oThis.forceAssignment || (await oThis.isSharedShard()))) {
        // Throw error if forceAssignment=false and isSharedShard = false
        errorCode = errorCodePrefix + '4';
        error_identifier = 'invalid_force_allocation';
      } else {
        return onResolve(responseHelper.successWithData({}));
      }

      logger.debug(errorCode, error_identifier);
      return onResolve(
        responseHelper.error({
          internal_error_identifier: errorCode,
          api_error_identifier: error_identifier,
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        })
      );
    });
  },

  /**
   * Clear affected cache associated with 'this' entity type and identifier
   *
   * @return {Promise<*>}
   */
  clearAnyAssociatedCache: async function() {
    const oThis = this,
      GetShardNameMultiCacheKlass = oThis.ic().getShardDetailsCacheKlass(),
      cacheParamsGetShard = {
        entity_type: oThis.entityType,
        identifiers: [oThis.identifier]
      };
    return await new GetShardNameMultiCacheKlass(cacheParamsGetShard).clear();
  }
};

InstanceComposer.registerShadowableClass(AssignShard, 'getDDBAssignShard');
module.exports = AssignShard;
