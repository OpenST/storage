/**
 * Token Balance Model
 *
 * @module lib/models/dynamodb/token_balance
 *
 */

const rootPrefix = '../../..'
  , BaseModel = require(rootPrefix + '/lib/models/dynamodb/base')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + '/config/core_constants')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , EntityTypesConst = require(rootPrefix + '/lib/global_constant/entity_types')
  , BigNumber = require('bignumber.js')
  , util = require(rootPrefix + '/lib/utils')
;

const longToShortNamesMap = {
  ethereum_address: 'ea',
  erc20_contract_address: 'erc20',
  settled_balance: 'sb',
  unsettled_debits: 'ud',
  pessimistic_settled_balance: 'psb',
  updated_timestamp: 'uts'
}
  , shortToLongNamesMap = util.invert(longToShortNamesMap)
;

/**
 * Token Balance Model
 *
 * @augments BaseModel
 *
 * @constructor
 */
const TokenBalanceModel = function (params) {
  const oThis = this
  ;

  oThis.erc20ContractAddress = params.erc20_contract_address;
  oThis.shardName = params.shard_name|| null;

  if(oThis.erc20ContractAddress) oThis.erc20ContractAddress = oThis.erc20ContractAddress.toLowerCase();

  oThis.entityType = EntityTypesConst.tokenBalanceEntityType;

  BaseModel.call(oThis, params);
};

TokenBalanceModel.prototype = Object.create(BaseModel.prototype);

const tokenBalanceModelSpecificPrototype = {

  shortToLongNamesMap: shortToLongNamesMap,

  longToShortNamesMap: longToShortNamesMap,

  /**
   * Get balance for eth address - Supports multi get
   *
   * getBalance({ ethereum_addresses: ['1234asdf','1234asdf1234'] })
   *
   * @return {promise<result>}
   */
  getBalance: async function (params) {
    const oThis = this
      , ethereum_addresses = JSON.parse(JSON.stringify(params['ethereum_addresses'])) // dup here as we would downcase addresses
    ;

    await oThis._getShard();

    let responseDbData = await oThis._getDataFromDynamoInBatches(ethereum_addresses);

    return responseHelper.successWithData(responseDbData.data);

  },

  /**
   * Convert row db data to long key format data.
   *
   * @param {String} rowDbData - Row db data.
   *
   * @return {Object}
   */
  convertDbDataToLongKeyFormat: function (rowDbData) {
    const oThis = this
      , responseDbData = {};

    for (var shortKey in rowDbData) {
      if (!oThis.longNameFor(shortKey)) continue;

      responseDbData[oThis.longNameFor(shortKey)] = Object.values(rowDbData[shortKey])[0]
    }

    return responseDbData;
  },

  /**
   * Settle balance record, create new record if not exist.
   *
   * @params {Object} params - Parameters
   * @param {String} params.ethereum_address - Ethereum address for whome amount is settling.
   * @param {String<number>} params.settle_amount - Signed amount to be settled. Give negative value to decrese, and positive to increse.
   * @param {String} params.un_settled_debit_amount - Signed amount to be settled. Give negative value to decrese, and positive to increse.
   *
   * @return {promise<result>}
   */
  update: async function(params) {

    params['ethereum_address'] = params['ethereum_address'].toLowerCase();

    const oThis = this;

    let deltaUD = params['un_settled_debit_amount'] || '0'
      , deltaSB = params['settle_amount'] || '0'
    ;

    await oThis._getShard();

    // New column = oldcolumn + delta(delta can be negative value)
    const deltaPessimisticBalance = ((new BigNumber(deltaSB)).minus(new BigNumber(deltaUD))).toString(10);

    const balanceParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj({ethereum_address: params['ethereum_address']}),
      UpdateExpression: "Add #unsettled_debits :deltaUD, #settled_balance :deltaSB " +
      ", #pessimistic_settled_balance :delta_pessimistic_balance ",
      ExpressionAttributeNames: {
        '#settled_balance': oThis.shortNameFor('settled_balance'),
        '#unsettled_debits': oThis.shortNameFor('unsettled_debits'),
        '#pessimistic_settled_balance': oThis.shortNameFor('pessimistic_settled_balance')
      },
      ExpressionAttributeValues: {
        ":deltaSB": {N: deltaSB},
        ":deltaUD": {N: deltaUD},
        ":delta_pessimistic_balance": {N: deltaPessimisticBalance}
      },
      ReturnValues: "NONE"
    };

    if((new BigNumber(deltaUD)).gt(new BigNumber(0))){
      balanceParams['ConditionExpression'] = "#pessimistic_settled_balance >= :deltaUD";
      balanceParams['ExpressionAttributeValues'][':deltaUD'] = {N: deltaUD};
      balanceParams['ExpressionAttributeNames']['#pessimistic_settled_balance'] = oThis.shortNameFor('pessimistic_settled_balance');
    }

    const updateResponse = await oThis.ddbServiceObj.updateItem(balanceParams, 10);
    if (updateResponse.isFailure()) {
      logger.error(`error update ethereum_address : ${params['ethereum_address']} contract_address : ${oThis.erc20ContractAddress}`, updateResponse.toHash());
      return Promise.reject(updateResponse)
    }

    // To remove circular dependency, cache to be required here.
    let TokenBalanceCache = require(rootPrefix + '/services/cache_multi_management/token_balance');

    await new TokenBalanceCache({
      erc20_contract_address: oThis.erc20ContractAddress,
      ethereum_addresses: [ params['ethereum_address'] ]
    }).clear();

    // const responseDbData = oThis.convertDbDataToLongKeyFormat(updateResponse.data.Attributes);
    //
    // if((responseDbData.settled_balance && responseDbData.settled_balance < 0) ||
    //   (responseDbData.unsettled_debits && responseDbData.unsettled_debits < 0) ){
    //
    //   logger.error('negativeBalance ethereum_addresses: ', params['ethereum_address'], " erc20_contract_address ", oThis.erc20ContractAddress);
    //
    //   return Promise.reject(responseHelper.error({
    //     internal_error_identifier: 'm_tb_update_1',
    //     api_error_identifier: "negative_balance",
    //     debug_options: {requestParams: JSON.stringify(params), updateResponse: JSON.stringify(updateResponse)},
    //     error_config: coreConstants.ERROR_CONFIG
    //   }))
    // }

    return Promise.resolve(responseHelper.successWithData({}));

  },

  /**
   * Overwrite balance of address to given amount.
   *
   * @params {Object} params - Parameters
   * @param {String} params.ethereum_address - Ethereum address for whome amount is settling.
   * @param {String<number>} params.settle_amount - Signed amount to be overwritten.
   * @param {String} params.un_settled_debit_amount - Signed amount to be overwritten.
   * @param {String} params.pessimistic_settled_balance - Signed amount to be overwritten.
   *
   * @return {promise<result>}
   */
  set: async function(params) {
    params['ethereum_address'] = params['ethereum_address'].toLowerCase();

    const oThis = this
      , unSettledDebitAmount = params['un_settled_debit_amount']
      , settleAmount = params['settle_amount']
      , pessimisticSettledBalance = params['pessimistic_settled_balance']
    ;

    var updateExpression = []
      , ExpressionAttributeValues = {};

    if(settleAmount){
      updateExpression.push(oThis.shortNameFor('settled_balance') +"=:amount");
      ExpressionAttributeValues[":amount"] = {N: settleAmount}
    }
    if(unSettledDebitAmount){
      updateExpression.push(oThis.shortNameFor('unsettled_debits') +"=:unsettled_debit_amount");
      ExpressionAttributeValues[":unsettled_debit_amount"] = {N: unSettledDebitAmount}
    }
    if(pessimisticSettledBalance){
      updateExpression.push(oThis.shortNameFor('pessimistic_settled_balance') +"=:pessimistic_settled_balance");
      ExpressionAttributeValues[":pessimistic_settled_balance"] = {N: pessimisticSettledBalance}
    }

    if(updateExpression.length == 0){
      return Promise.reject(responseHelper.error({
        internal_error_identifier: 'm_tb_set_1',
        api_error_identifier: "invalid_balance",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      }))
    }

    await oThis._getShard();

    const balanceParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj({ethereum_address: params['ethereum_address']}),
      UpdateExpression: "SET "+ updateExpression.join(','),
      ExpressionAttributeValues: ExpressionAttributeValues,
      ReturnValues: "NONE"
    };

    const updateResponse = await oThis.ddbServiceObj.updateItem(balanceParams, 10);

    // To remove circular dependency, cache to be required here.
    let TokenBalanceCache = require(rootPrefix + '/services/cache_multi_management/token_balance');

    await new TokenBalanceCache({
      erc20_contract_address: oThis.erc20ContractAddress,
      ethereum_addresses: [ params['ethereum_address'] ]
    }).clear();

    return Promise.resolve(responseHelper.successWithData(updateResponse));
  },

  /**
   * Primary key of the table.
   *
   * @return {object}
   */
  _keyObj: function (params) {
    const oThis = this
      , keyObj = {}
    ;

    keyObj[oThis.shortNameFor('ethereum_address')] = { S: params['ethereum_address'] };
    keyObj[oThis.shortNameFor('erc20_contract_address')] = { S: oThis.erc20ContractAddress };

    return keyObj;
  },

  /**
   * Shard Identifier
   *
   * @return {string}
   */
  _shardIdentifier: function () {
    const oThis = this
    ;

    return oThis.erc20ContractAddress;
  },

  /**
   * Create table params
   *
   * @return {object}
   */
  _createTableParams: function (shardName) {
    const oThis = this
    ;

    return {
      TableName : shardName,
      KeySchema: [
        {
          AttributeName: oThis.shortNameFor('ethereum_address'),
          KeyType: "HASH"
        },
        {
          AttributeName: oThis.shortNameFor('erc20_contract_address'),
          KeyType: "RANGE"
        }
      ],
      AttributeDefinitions: [
        { AttributeName: oThis.shortNameFor('ethereum_address'), AttributeType: "S" },
        { AttributeName: oThis.shortNameFor('erc20_contract_address'), AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      SSESpecification: {
        Enabled: false
      },
    };

  },

  /**
   * Get data from Dynamo in batches
   */

  _getDataFromDynamoInBatches: async function (ethereum_addresses) {
    const oThis = this
    ;

    let queryKeys = [];
    let concurrentRequestsLimit = 3;
    let queryParamsLimit = 90;

    let queryKeysCount = 0;
    let subQueryKeys = [];

    // Batch the query params
    for (let i = 0; i < ethereum_addresses.length; i ++) {

      if (queryKeysCount == queryParamsLimit) {
        queryKeys.push(subQueryKeys);
        subQueryKeys = [];
        queryKeysCount = 0;
      }

      ethereum_addresses[i] = ethereum_addresses[i].toLowerCase();
      subQueryKeys.push(oThis._keyObj({ethereum_address: ethereum_addresses[i]}));
      queryKeysCount += 1;
    }

    if (queryKeysCount > 0) {
      queryKeys.push(subQueryKeys);
    }

    let promiseArray = [];
    let parallelRequestCount = 0;
    let responseData = {};

    for (let i=0; i < queryKeys.length; i++) {

      if (parallelRequestCount == concurrentRequestsLimit) {

        let readDataResponse = await oThis._readData(promiseArray);

        Object.assign(responseData, readDataResponse.data);

        promiseArray = [];
        parallelRequestCount = 0;
      }

      let bachGetParams = {
        RequestItems: {
          [oThis.shardName]: { Keys: queryKeys[i], ConsistentRead: true }
        }
      };

      promiseArray.push(oThis.ddbServiceObj.batchGetItem(bachGetParams, 3));
      parallelRequestCount += 1;
    }

    if (parallelRequestCount > 0) {
      let readDataResponse = await oThis._readData(promiseArray);

      Object.assign(responseData, readDataResponse.data);
      promiseArray = [];
    }

    return responseHelper.successWithData(responseData);

  },

  _readData: async function (promiseArray) {
    const oThis = this
    ;

    let responseArray = await Promise.all(promiseArray);

    let responseDbData = {};

    for (let i = 0; i< responseArray.length; i++) {

      let response = responseArray[i];

      if(response.isFailure()) {
        return Promise.reject(response);
      }

      if(response.data.Responses) {
        var rawData = response.data.Responses[oThis.shardName]
          , convertedDbData = {};

        for(let i=0; i<rawData.length; i++ ) {
          convertedDbData = oThis.convertDbDataToLongKeyFormat(rawData[i]);
          responseDbData[convertedDbData['ethereum_address'].toLowerCase()] = convertedDbData;
        }
      }
    }

    return responseHelper.successWithData(responseDbData);
  }

};

Object.assign(TokenBalanceModel.prototype, tokenBalanceModelSpecificPrototype);

module.exports = TokenBalanceModel;