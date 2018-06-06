"use strict";

const rootPrefix = '../..'
  , baseCache = require(rootPrefix + '/services/cache_multi_management/base')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + '/config/core_constants')
  , TokenBalanceModel = require(rootPrefix + '/lib/models/token_balance')
  , logger = require( rootPrefix + '/lib/logger/custom_console_logger')
  , BigNumber = require('bignumber.js')
;


/**
 * GetBalanceCacheKlass
 *
 * @param params
 * @param {string} params.erc20_contract_address
 * @param {string} params.ethereum_address
 * @param {object} params.ddb_service
 * @param {object} params.auto_scaling
 *
 * @constructor
 */
const GetBalanceCacheKlass = function (params) {
  const oThis = this
  ;

  oThis.erc20ContractAddress = params.erc20_contract_address;
  oThis.ethereumAddresses = params.ethereum_addresses;
  oThis.ddbServiceObj = params.ddb_service || {};
  oThis.autoScalingObj = params.auto_scaling || {};

  baseCache.call(this, params);
};

GetBalanceCacheKlass.prototype = Object.create(baseCache.prototype);

GetBalanceCacheKlass.prototype.constructor = GetBalanceCacheKlass;

const GetBalanceCache = {

  /**
   * setCacheKeys - set cache keys
   *
   * @return {Object}
   */
  setCacheKeys: function () {
    const oThis = this
    ;

    oThis.cacheKeys = {};
    for (let i = 0; i < oThis.ethereumAddresses.length; i++) {

      oThis.cacheKeys[oThis._cacheKeyPrefix() + 'bt_blnce' + '_ca_' +
        oThis.erc20ContractAddress.toLowerCase() + '_ea_' + oThis.ethereumAddresses[i].toLowerCase()] = oThis.ethereumAddresses[i].toLowerCase();
    }

    return oThis.cacheKeys;
  },

  /**
   *  setCacheExpiry
   *
   *  @return {Number}
   */
  setCacheExpiry: function () {
    const oThis = this
    ;

    oThis.cacheExpiry = 86400 * 3; // 3 days

    return oThis.cacheExpiry;
  },

  /**
   * fetchDataFromSource
   *
   * @param ethereumAddresses
   * @return {Result}
   *
   */
  fetchDataFromSource: async function (ethereumAddresses) {

    const oThis = this;

    if (!ethereumAddresses) {

      return responseHelper.error({
        internal_error_identifier: "s_cmm_gb_1",
        api_error_identifier: "invalid_cache_ids",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      })
    }

    if (!oThis.erc20ContractAddress) {
      return responseHelper.error({
        internal_error_identifier: "s_cmm_gb_5",
        api_error_identifier: "invalid_params",
        params_error_identifiers: ['missing_contract_address'],
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      })
    }

    let getBalanceResponse = await new TokenBalanceModel({
      ddb_service: oThis.ddbServiceObj,
      auto_scaling: oThis.autoScalingObj,
      erc20_contract_address: oThis.erc20ContractAddress.toLowerCase()
    })
      .getBalance({
        ethereum_addresses: ethereumAddresses
      }).catch(function(error) {

        if (responseHelper.isCustomResult(error)){
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
        internal_error_identifier: "s_cmm_gb_3",
        api_error_identifier: "ddb_method_call_error",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      })
    }

    let resultData = {};

    for (let i = 0; i < ethereumAddresses.length; i++) {

      let eth_address = ethereumAddresses[i].toLowerCase();
      let defaultValues = {
        settled_balance: '0',
        unsettled_debits: '0'
      };
      let dataFromModel = getBalanceResponse.data[eth_address] || {};

      dataFromModel.settled_balance = dataFromModel.settled_balance || defaultValues.settled_balance;
      dataFromModel.unsettled_debits = dataFromModel.unsettled_debits || defaultValues.unsettled_debits;
      dataFromModel.available_balance = new BigNumber(dataFromModel.settled_balance)
        .minus(new BigNumber(dataFromModel.unsettled_debits)).toString(10);

      resultData[eth_address] = dataFromModel;
    }

    return responseHelper.successWithData(resultData);
  }

};

Object.assign(GetBalanceCacheKlass.prototype, GetBalanceCache);

module.exports = GetBalanceCacheKlass;
