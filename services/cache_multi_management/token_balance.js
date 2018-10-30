'use strict';

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  baseCache = require(rootPrefix + '/services/cache_multi_management/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  BigNumber = require('bignumber.js');

require(rootPrefix + '/config/core_constants');
require(rootPrefix + '/lib/models/dynamodb/token_balance');

/**
 * GetBalanceCacheKlass
 *
 * @param params
 * @param {string} params.erc20_contract_address
 * @param {string} params.ethereum_address
 * @param {object} params.ddb_service
 * @param {object} params.auto_scaling
 *
 * @augments baseCache
 *
 * @constructor
 */
const TokenBalanceCache = function(params) {
  const oThis = this;

  oThis.erc20ContractAddress = params.erc20_contract_address;
  oThis.shardName = params.shard_name;
  oThis.ethereumAddresses = JSON.parse(JSON.stringify(params.ethereum_addresses));

  // sanitize the params
  if (oThis.erc20ContractAddress) oThis.erc20ContractAddress = oThis.erc20ContractAddress.toLowerCase();
  if (oThis.ethereumAddresses) {
    for (let index = 0; index < oThis.ethereumAddresses.length; index++) {
      oThis.ethereumAddresses[index] = oThis.ethereumAddresses[index].toLowerCase();
    }
  }

  baseCache.call(this, params);
};

TokenBalanceCache.prototype = Object.create(baseCache.prototype);

TokenBalanceCache.prototype.constructor = TokenBalanceCache;

const tokenBalanceCacheSpecificPrototype = {
  /**
   * set cache key to external id map
   *
   * Sets oThis.cacheKeyToexternalIdMap - this is mapping from cache_key to externally understood ids
   *
   * @return {Object}
   */
  setCacheKeyToexternalIdMap: function() {
    const oThis = this;

    oThis.cacheKeyToexternalIdMap = {};
    for (let i = 0; i < oThis.ethereumAddresses.length; i++) {
      let ethereumAddress = oThis.ethereumAddresses[i];

      oThis.cacheKeyToexternalIdMap[oThis._cacheKeyFor(ethereumAddress)] = ethereumAddress;
    }

    return oThis.cacheKeyToexternalIdMap;
  },

  /**
   *  setCacheExpiry
   *
   *  @return {Number}
   */
  setCacheExpiry: function() {
    const oThis = this;

    oThis.cacheExpiry = 86400 * 3; // 3 days

    return oThis.cacheExpiry;
  },

  /**
   * fetchDataFromSource
   *
   * @param ethereumAddresses {array<string>} - array of ethereum addresses
   *
   * @return {result}
   *
   */
  fetchDataFromSource: async function(ethereumAddresses) {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants(),
      TokenBalanceModel = oThis.ic().getLibDDBTokenBalanceModel();

    if (!ethereumAddresses) {
      return responseHelper.error({
        internal_error_identifier: 's_cmm_gb_1',
        api_error_identifier: 'invalid_cache_ids',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    if (!oThis.erc20ContractAddress) {
      return responseHelper.error({
        internal_error_identifier: 's_cmm_gb_5',
        api_error_identifier: 'invalid_params',
        params_error_identifiers: ['missing_contract_address'],
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    let getBalanceResponse = await new TokenBalanceModel({
      erc20_contract_address: oThis.erc20ContractAddress,
      shard_name: oThis.shardName
    })
      .getBalance({
        ethereum_addresses: ethereumAddresses
      })
      .catch(function(error) {
        if (responseHelper.isCustomResult(error)) {
          return error;
        } else {
          logger.error(`${__filename}::perform::catch`);
          logger.error(error);
          return responseHelper.error({
            internal_error_identifier: 's_cmm_gb_2',
            api_error_identifier: 'unhandled_catch_response',
            debug_options: {},
            error_config: coreConstants.ERROR_CONFIG
          });
        }
      });

    if (getBalanceResponse.isFailure()) {
      return responseHelper.error({
        internal_error_identifier: 's_cmm_gb_3',
        api_error_identifier: 'ddb_method_call_error',
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    let resultData = {};

    for (let i = 0; i < ethereumAddresses.length; i++) {
      let eth_address = ethereumAddresses[i];
      let defaultValues = {
        settled_balance: '0',
        unsettled_debits: '0'
      };
      let dataFromModel = getBalanceResponse.data[eth_address] || {};

      dataFromModel.settled_balance = dataFromModel.settled_balance || defaultValues.settled_balance;
      dataFromModel.unsettled_debits = dataFromModel.unsettled_debits || defaultValues.unsettled_debits;

      let unsettled_debits_bn = new BigNumber(dataFromModel.unsettled_debits);

      if (unsettled_debits_bn.lt(0)) {
        unsettled_debits_bn = new BigNumber(0);
      }

      dataFromModel.available_balance = new BigNumber(dataFromModel.settled_balance)
        .minus(unsettled_debits_bn)
        .toString(10);

      resultData[eth_address] = dataFromModel;
    }

    return responseHelper.successWithData(resultData);
  },

  /**
   * cache key for erc20 addr and eth addr
   *
   * @param {string} ethereumAddress - ethereum address
   *
   * @return {Object}
   */
  _cacheKeyFor: function(ethereumAddress) {
    const oThis = this;

    return oThis._cacheKeyPrefix() + 'bt_blnce' + '_ca_' + oThis.erc20ContractAddress + '_ea_' + ethereumAddress;
  }
};

Object.assign(TokenBalanceCache.prototype, tokenBalanceCacheSpecificPrototype);

InstanceComposer.registerShadowableClass(TokenBalanceCache, 'getDDBTokenBalanceCache');

module.exports = TokenBalanceCache;
