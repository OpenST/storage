'use strict';

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  baseCache = require(rootPrefix + '/services/cache_multi_management/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

require(rootPrefix + '/lib/models/dynamodb/shard_management/managed_shard');
require(rootPrefix + '/config/core_constants');

/**
 * @constructor
 *
 * @augments baseCache
 *
 * @param {Object} params - cache key generation & expiry related params
 * @param {Array} params.identifiers - identifiers is an array containing identifier
 * @param {String} params.entity_type - Entity type of Item
 *
 */
const GetShardDetailsCacheKlass = function(params) {
  const oThis = this;
  oThis.params = params;
  oThis.identifiers = params.identifiers;
  oThis.entityType = params.entity_type;

  baseCache.call(this, oThis.params);
};

GetShardDetailsCacheKlass.prototype = Object.create(baseCache.prototype);

GetShardDetailsCacheKlass.prototype.constructor = GetShardDetailsCacheKlass;

/**
 * set cache key
 *
 * @return {Object}
 */
GetShardDetailsCacheKlass.prototype.setCacheKeyToexternalIdMap = function() {
  const oThis = this;

  oThis.cacheKeyToexternalIdMap = {};
  for (let i = 0; i < oThis.identifiers.length; i++) {
    oThis.cacheKeyToexternalIdMap[
      oThis._cacheKeyPrefix() + 'dy_sm_gsd_' + '_et_' + oThis.entityType + '_id_' + oThis.identifiers[i]
    ] =
      oThis.identifiers[i];
  }

  return oThis.cacheKeyToexternalIdMap;
};

/**
 * set cache expiry in oThis.cacheExpiry and return it
 *
 * @return {Number}
 */
GetShardDetailsCacheKlass.prototype.setCacheExpiry = function() {
  const oThis = this;

  oThis.cacheExpiry = 86400; // 24 hours ;

  return oThis.cacheExpiry;
};

/**
 * fetch data from source
 *
 * @return {Result}
 */
GetShardDetailsCacheKlass.prototype.fetchDataFromSource = async function(cacheIds) {
  const oThis = this,
    managedShard = oThis.ic().getLibModelsManagedShard(),
    coreConstants = oThis.ic().getCoreConstants();

  if (!cacheIds) {
    return responseHelper.error({
      internal_error_identifier: 's_cmm_gsd_1',
      api_error_identifier: 'invalid_cache_ids',
      debug_options: {},
      error_config: coreConstants.ERROR_CONFIG
    });
  }

  return await managedShard.getShard(
    Object.assign({}, oThis.params, {
      identifiers: cacheIds
    })
  );
};

InstanceComposer.registerShadowableClass(GetShardDetailsCacheKlass, 'getShardDetailsCacheKlass');

module.exports = GetShardDetailsCacheKlass;
