"use strict";

//External Libraries
const openStCache = require('@openstfoundation/openst-cache');


const rootPrefix = '../..'
  , coreConstants = require(rootPrefix + '/config/core_constants')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , utils = require(rootPrefix + '/lib/utils')
;

const cacheImplementer = new openStCache.cache(coreConstants.CACHING_ENGINE, true)
;

/**
 * constructor
 *
 * @param {Object} params - cache key generation & expiry related params
 *
 * @constructor
 */
const BaseCache = function (params) {

  const oThis = this;

  if (!params) {
    params = {};
  }

  oThis.params = params;

  oThis.cacheKeyToexternalIdMap = {};

  // call sub class method to set cache keys using params provided
  oThis.setCacheKeyToexternalIdMap();
};

BaseCache.prototype = {

  /**
   * Fetch data from cache, in case of cache miss calls sub class method to fetch data from source
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  fetch: async function () {
    const oThis = this
    ;

    let data = await oThis._fetchFromCache()
      , fetchDataRsp = null;

    // if there are any cache misses then fetch that data from source.
    if (data['cacheMiss'].length > 0) {
      fetchDataRsp = await oThis.fetchDataFromSource(data['cacheMiss']);

      // if fetch from source failed do not set cache and return error response
      if (fetchDataRsp.isFailure()) {
        logger.notify('l_cm_b_1', 'Something Went Wrong', fetchDataRsp);
        return Promise.resolve(fetchDataRsp);
      } else {
        // DO NOT WAIT for cache being set
        let cacheKeys = Object.keys(fetchDataRsp.data);
        for (let i = 0; i < cacheKeys.length; i++) {
          let key = cacheKeys[i];
          let dataToSet = fetchDataRsp.data[key];
          data['cachedData'][key] = dataToSet;
          oThis._setCache(key, dataToSet);
        }
      }
    }

    return Promise.resolve(responseHelper.successWithData(data['cachedData']));
  },

  /**
   * Clear cache
   *
   * @return {Promise<Result>}
   */
  clear: async function () {
    const oThis = this
    ;

    for (let i = 0; i < Object.keys(oThis.cacheKeyToexternalIdMap).length; i++) {
      let cacheKey = Object.keys(oThis.cacheKeyToexternalIdMap)[i];
      await cacheImplementer.del(cacheKey);
    }
  },

  // methods which sub class would have to implement

  /**
   * Set cache keys in oThis.cacheKeyToexternalIdMap and return it
   *
   * @return {String}
   */
  setCacheKeyToexternalIdMap: function () {
    throw 'sub class to implement';
  },

  /**
   * set cache expiry in oThis.cacheExpiry and return it
   *
   * @return {Number}
   */
  setCacheExpiry: function () {
    throw 'sub class to implement';
  },

  /**
   * fetch data from source
   * return should be of klass Result
   * data attr of return is returned and set in cache
   *
   * @return {Result}
   */
  fetchDataFromSource: async function (cacheIds) {
    throw 'sub class to implement';
  },

  // private methods from here

  /**
   * fetch from cache
   *
   * @return {Object}
   */
  _fetchFromCache: async function () {

    const oThis = this;
    let cacheFetchResponse = null
      , cacheKeys = Object.keys(oThis.cacheKeyToexternalIdMap);

    cacheFetchResponse = await cacheImplementer.multiGet(cacheKeys);
    let cacheMiss = []
      , cachedResponse = {}
    ;

    if (cacheFetchResponse.isSuccess()) {
      let cachedData = cacheFetchResponse.data.response;
      for (let i = 0; i < cacheKeys.length; i++) {
        let cacheKey = cacheKeys[i];
        if (cachedData[cacheKey]) {
          cachedResponse[oThis.cacheKeyToexternalIdMap[cacheKey]] = JSON.parse(cachedData[cacheKey]);
        } else {
          cacheMiss.push(oThis.cacheKeyToexternalIdMap[cacheKey]);
        }
      }
    } else {
      logger.error("==>Error while getting from cache: ", cacheFetchResponse);
      for (let i = 0; i < cacheKeys.length; i++) {
        let cacheKey = cacheKeys[i];
        cacheMiss.push(oThis.cacheKeyToexternalIdMap[cacheKey]);
      }
    }

    return {cacheMiss: cacheMiss, cachedData: cachedResponse};
  },

  /**
   * set data in cache.
   *
   * @param {string} key - key
   * @param {Object} dataToSet - data to set in cache
   *
   * @return {result}
   */
  _setCache: function (key, dataToSet) {

    const oThis = this;

    var setCacheFunction = function (k, v) {
      var cacheKey = utils.invert(oThis.cacheKeyToexternalIdMap)[k];
      return cacheImplementer.set(cacheKey, JSON.stringify(v), oThis.cacheExpiry);
    };

    setCacheFunction(key, dataToSet).then(function (cacheSetResponse) {

      if (cacheSetResponse.isFailure()) {
        logger.error('cmm_b_2', 'Something Went Wrong', cacheSetResponse);
      }
    });
  },

  /**
   * cache key prefix
   *
   * @return {String}
   */
  _cacheKeyPrefix: function () {
    const oThis = this;
    return 'ost_base_';
  }

};

module.exports = BaseCache;