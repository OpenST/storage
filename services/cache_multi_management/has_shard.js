'use strict';

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  baseCache = require(rootPrefix + '/services/cache_multi_management/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

require(rootPrefix + '/lib/models/dynamodb/shard_management/available_shard');
require(rootPrefix + '/config/core_constants');

/**
 * @constructor
 *
 * @augments baseCache
 *
 * @param {Object} params - cache key generation & expiry related params
 *
 */

const HasShardKlass = function(params) {
  const oThis = this;
  oThis.params = params;
  oThis.shardNames = params.shard_names;

  baseCache.call(this, oThis.params);
};

HasShardKlass.prototype = Object.create(baseCache.prototype);

HasShardKlass.prototype.constructor = HasShardKlass;

/**
 * set cache key
 *
 * @return {Object}
 */
HasShardKlass.prototype.setCacheKeyToexternalIdMap = function() {
  const oThis = this;

  oThis.cacheKeyToexternalIdMap = {};
  for (let i = 0; i < oThis.shardNames.length; i++) {
    oThis.cacheKeyToexternalIdMap[oThis._cacheKeyPrefix() + 'dy_sm_hs_' + oThis.shardNames[i]] = oThis.shardNames[i];
  }

  return oThis.cacheKeyToexternalIdMap;
};

/**
 * set cache expiry in oThis.cacheExpiry and return it
 *
 * @return {Number}
 */
HasShardKlass.prototype.setCacheExpiry = function() {
  const oThis = this;

  oThis.cacheExpiry = 86400; // 24 hours ;

  return oThis.cacheExpiry;
};

/**
 * fetch data from source
 *
 * @return {Result}
 */
HasShardKlass.prototype.fetchDataFromSource = async function(cacheIds) {
  const oThis = this,
    coreConstants = oThis.ic().getCoreConstants(),
    availableShard = oThis.ic().getDDBServiceAvailableShard();

  if (!cacheIds) {
    return responseHelper.error({
      internal_error_identifier: 's_cmm_hs_1',
      api_error_identifier: 'invalid_cache_ids',
      debug_options: {},
      error_config: coreConstants.ERROR_CONFIG
    });
  }

  return await availableShard.hasShard(
    Object.assign({}, oThis.params, {
      shard_names: cacheIds
    })
  );
};

InstanceComposer.registerShadowableClass(HasShardKlass, 'getDDBServiceHasShardKlass');

module.exports = HasShardKlass;
