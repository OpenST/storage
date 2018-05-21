"use strict";

const rootPrefix = '../..'
  , baseCache = require(rootPrefix + '/services/cache_multi_management/base')
  , availableShard = require(rootPrefix + '/lib/models/dynamodb/available_shard')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
;

/**
 * @constructor
 * @augments HasShardKlass
 *
 * @param {Object} params - cache key generation & expiry related params
 *
 */
const HasShardKlass = module.exports = function (params) {

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
HasShardKlass.prototype.setCacheKeys = function () {

  const oThis = this;

  oThis.cacheKeys = {};
  for (let i = 0; i < oThis.shardNames.length; i++) {
    oThis.cacheKeys[oThis._cacheKeyPrefix() + "dy_sm_hs_" + oThis.shardNames[i]] = oThis.shardNames[i];
  }

  return oThis.cacheKeys;

};

/**
 * set cache expiry in oThis.cacheExpiry and return it
 *
 * @return {Number}
 */
HasShardKlass.prototype.setCacheExpiry = function () {

  const oThis = this;

  oThis.cacheExpiry = 86400; // 24 hours ;

  return oThis.cacheExpiry;

};

/**
 * fetch data from source
 *
 * @return {Result}
 */
HasShardKlass.prototype.fetchDataFromSource = async function (cacheIds) {

  const oThis = this;

  if (!cacheIds) {
    return responseHelper.paramValidationError({
      internal_error_identifier: "s_cmm_hs_1",
      api_error_identifier: "invalid_api_params",
      params_error_identifiers: ["blank_ids"],
      debug_options: {},
      error_config: coreConstants.ERROR_CONFIG
    })
  }

  return await availableShard.hasShard(Object.assign({}, oThis.params, {
    shard_names: cacheIds
  }));
};