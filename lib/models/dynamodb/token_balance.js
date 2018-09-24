/**
 * Token Balance Model
 *
 * @module lib/models/dynamodb/token_balance
 *
 */

const rootPrefix = '../../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  BaseModel = require(rootPrefix + '/lib/models/dynamodb/base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  BigNumber = require('bignumber.js'),
  util = require(rootPrefix + '/lib/utils');

require(rootPrefix + '/config/core_constants');
require(rootPrefix + '/services/cache_multi_management/token_balance');

const longToShortNamesMap = {
    ethereum_address: 'ea',
    erc20_contract_address: 'erc20',
    settled_balance: 'sb',
    unsettled_debits: 'ud',
    pessimistic_settled_balance: 'psb',
    updated_timestamp: 'uts'
  },
  shortToLongNamesMap = util.invert(longToShortNamesMap);

/**
 * Token Balance Model
 *
 * @augments BaseModel
 *
 * @constructor
 */
const TokenBalanceModel = function(params) {
  const oThis = this;

  oThis.erc20ContractAddress = params.erc20_contract_address;
  oThis.shardName = params.shard_name;

  if (oThis.erc20ContractAddress) oThis.erc20ContractAddress = oThis.erc20ContractAddress.toLowerCase();

  BaseModel.call(oThis);
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
  getBalance: async function(params) {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants();
    ethereum_addresses = JSON.parse(JSON.stringify(params['ethereum_addresses'])); // dup here as we would downcase addresses

    if (!oThis.shardName) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'm_tb_get_1',
          api_error_identifier: 'invalid_shard_name',
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        })
      );
    }

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
  convertDbDataToLongKeyFormat: function(rowDbData) {
    const oThis = this,
      responseDbData = {};

    for (let shortKey in rowDbData) {
      if (!oThis.longNameFor(shortKey)) continue;

      if (oThis.longNameFor(shortKey) === 'settled_balance') {
        rowDbData[shortKey].N = new BigNumber(rowDbData[shortKey].N).toString(10);
      } else if (oThis.longNameFor(shortKey) === 'unsettled_debits') {
        rowDbData[shortKey].N = new BigNumber(rowDbData[shortKey].N).toString(10);
      } else if (oThis.longNameFor(shortKey) === 'pessimistic_settled_balance') {
        rowDbData[shortKey].N = new BigNumber(rowDbData[shortKey].N).toString(10);
      }

      responseDbData[oThis.longNameFor(shortKey)] = Object.values(rowDbData[shortKey])[0];
    }

    return responseDbData;
  },

  /**
   * Settle balance record, create new record if not exist.
   *
   * @params {Object} params - Parameters
   * @param {String} params.ethereum_address - Ethereum address for whom amount is settling.
   * @param {String<number>} params.settle_amount - Signed amount to be settled. Give negative value to decrease, and positive to increase.
   * @param {String} params.un_settled_debit_amount - Signed amount to be settled. Give negative value to decrease, and positive to increase.
   *
   * @return {Promise<result>}
   */
  update: async function(params) {
    params['ethereum_address'] = params['ethereum_address'].toLowerCase();

    const oThis = this,
      ddbServiceObj = oThis.ic().getDynamoDBService();

    let deltaUD = params['un_settled_debit_amount'] || '0',
      deltaSB = params['settle_amount'] || '0';

    // New column = oldcolumn + delta(delta can be negative value)
    const deltaPessimisticBalance = new BigNumber(deltaSB).minus(new BigNumber(deltaUD)).toString(10);

    const balanceParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj({ ethereum_address: params['ethereum_address'] }),
      UpdateExpression:
        'Add #unsettled_debits :deltaUD, #settled_balance :deltaSB ' +
        ', #pessimistic_settled_balance :delta_pessimistic_balance ',
      ExpressionAttributeNames: {
        '#settled_balance': oThis.shortNameFor('settled_balance'),
        '#unsettled_debits': oThis.shortNameFor('unsettled_debits'),
        '#pessimistic_settled_balance': oThis.shortNameFor('pessimistic_settled_balance')
      },
      ExpressionAttributeValues: {
        ':deltaSB': { N: deltaSB },
        ':deltaUD': { N: deltaUD },
        ':delta_pessimistic_balance': { N: deltaPessimisticBalance }
      },
      ReturnValues: 'NONE'
    };

    if (new BigNumber(deltaUD).gt(new BigNumber(0))) {
      balanceParams['ConditionExpression'] = '#pessimistic_settled_balance >= :deltaUD';
      balanceParams['ExpressionAttributeValues'][':deltaUD'] = { N: deltaUD };
      balanceParams['ExpressionAttributeNames']['#pessimistic_settled_balance'] = oThis.shortNameFor(
        'pessimistic_settled_balance'
      );
    }

    const updateResponse = await ddbServiceObj.updateItem(balanceParams, 10);
    if (updateResponse.isFailure()) {
      logger.error(
        `error update ethereum_address : ${params['ethereum_address']} contract_address : ${
          oThis.erc20ContractAddress
        }`,
        updateResponse.toHash()
      );
      return Promise.reject(updateResponse);
    }

    // To remove circular dependency, cache to be required here.
    let TokenBalanceCache = oThis.ic().getDDBTokenBalanceCache();

    await new TokenBalanceCache({
      erc20_contract_address: oThis.erc20ContractAddress,
      ethereum_addresses: [params['ethereum_address']],
      shard_name: oThis.shardName
    }).clear();

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
   * @return {Promise<result>}
   */
  set: async function(params) {
    params['ethereum_address'] = params['ethereum_address'].toLowerCase();

    const oThis = this,
      unSettledDebitAmount = params['un_settled_debit_amount'],
      settleAmount = params['settle_amount'],
      pessimisticSettledBalance = params['pessimistic_settled_balance'],
      coreConstants = oThis.ic().getCoreConstants(),
      ddbServiceObj = oThis.ic().getDynamoDBService();

    let updateExpression = [],
      ExpressionAttributeValues = {};

    if (settleAmount) {
      updateExpression.push(oThis.shortNameFor('settled_balance') + '=:amount');
      ExpressionAttributeValues[':amount'] = { N: settleAmount };
    }
    if (unSettledDebitAmount) {
      updateExpression.push(oThis.shortNameFor('unsettled_debits') + '=:unsettled_debit_amount');
      ExpressionAttributeValues[':unsettled_debit_amount'] = { N: unSettledDebitAmount };
    }
    if (pessimisticSettledBalance) {
      updateExpression.push(oThis.shortNameFor('pessimistic_settled_balance') + '=:pessimistic_settled_balance');
      ExpressionAttributeValues[':pessimistic_settled_balance'] = { N: pessimisticSettledBalance };
    }

    if (updateExpression.length === 0) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'm_tb_set_1',
          api_error_identifier: 'invalid_balance',
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        })
      );
    }

    const balanceParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj({ ethereum_address: params['ethereum_address'] }),
      UpdateExpression: 'SET ' + updateExpression.join(','),
      ExpressionAttributeValues: ExpressionAttributeValues,
      ReturnValues: 'NONE'
    };

    const updateResponse = await ddbServiceObj.updateItem(balanceParams, 10);

    // To remove circular dependency, cache to be required here.
    let TokenBalanceCache = oThis.ic().getDDBTokenBalanceCache();

    await new TokenBalanceCache({
      erc20_contract_address: oThis.erc20ContractAddress,
      ethereum_addresses: [params['ethereum_address']],
      shard_name: oThis.shardName
    }).clear();

    return Promise.resolve(responseHelper.successWithData(updateResponse));
  },

  /**
   * Primary key of the table.
   *
   * @return {object}
   */
  _keyObj: function(params) {
    const oThis = this,
      keyObj = {};

    keyObj[oThis.shortNameFor('ethereum_address')] = { S: params['ethereum_address'] };
    keyObj[oThis.shortNameFor('erc20_contract_address')] = { S: oThis.erc20ContractAddress };

    return keyObj;
  },

  /**
   * Shard Identifier
   *
   * @return {string}
   */
  _shardIdentifier: function() {
    const oThis = this;

    return oThis.erc20ContractAddress;
  },

  /**
   * Create table params
   *
   * @return {object}
   */
  _createTableParams: function(shardName) {
    const oThis = this;

    return {
      TableName: shardName,
      KeySchema: [
        {
          AttributeName: oThis.shortNameFor('ethereum_address'),
          KeyType: 'HASH'
        },
        {
          AttributeName: oThis.shortNameFor('erc20_contract_address'),
          KeyType: 'RANGE'
        }
      ],
      AttributeDefinitions: [
        { AttributeName: oThis.shortNameFor('ethereum_address'), AttributeType: 'S' },
        { AttributeName: oThis.shortNameFor('erc20_contract_address'), AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      SSESpecification: {
        Enabled: false
      }
    };
  },

  /**
   * Get data from Dynamo in batches
   *
   * @param ethereum_addresses - list of ethereum addresses
   */

  _getDataFromDynamoInBatches: async function(ethereum_addresses) {
    const oThis = this,
      ddbServiceObj = oThis.ic().getDynamoDBService();

    let queryKeys = [];
    let concurrentRequestsLimit = 3;
    let queryParamsLimit = 90;

    let queryKeysCount = 0;
    let subQueryKeys = [];

    // Batch the query params
    for (let i = 0; i < ethereum_addresses.length; i++) {
      if (queryKeysCount === queryParamsLimit) {
        queryKeys.push(subQueryKeys);
        subQueryKeys = [];
        queryKeysCount = 0;
      }

      ethereum_addresses[i] = ethereum_addresses[i].toLowerCase();
      subQueryKeys.push(oThis._keyObj({ ethereum_address: ethereum_addresses[i] }));
      queryKeysCount += 1;
    }

    if (queryKeysCount > 0) {
      queryKeys.push(subQueryKeys);
    }

    let promiseArray = [];
    let parallelRequestCount = 0;
    let responseData = {};

    for (let i = 0; i < queryKeys.length; i++) {
      if (parallelRequestCount === concurrentRequestsLimit) {
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

      promiseArray.push(ddbServiceObj.batchGetItem(bachGetParams, 3));
      parallelRequestCount += 1;
    }

    if (parallelRequestCount > 0) {
      let readDataResponse = await oThis._readData(promiseArray);

      Object.assign(responseData, readDataResponse.data);
      promiseArray = [];
    }

    return responseHelper.successWithData(responseData);
  },

  _readData: async function(promiseArray) {
    const oThis = this;

    let responseArray = await Promise.all(promiseArray);

    let responseDbData = {};

    for (let i = 0; i < responseArray.length; i++) {
      let response = responseArray[i];

      if (response.isFailure()) {
        return Promise.reject(response);
      }

      if (response.data.Responses) {
        let rawData = response.data.Responses[oThis.shardName],
          convertedDbData = {};

        for (let i = 0; i < rawData.length; i++) {
          convertedDbData = oThis.convertDbDataToLongKeyFormat(rawData[i]);
          responseDbData[convertedDbData['ethereum_address'].toLowerCase()] = convertedDbData;
        }
      }
    }

    return responseHelper.successWithData(responseDbData);
  }
};

Object.assign(TokenBalanceModel.prototype, tokenBalanceModelSpecificPrototype);

InstanceComposer.registerShadowableClass(TokenBalanceModel, 'getLibDDBTokenBalanceModel');

module.exports = TokenBalanceModel;
