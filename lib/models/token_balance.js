const rootPrefix = '../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + '/config/core_constants')
  , BigNumber = require('bignumber.js')
;

/**
 * Token Balance Model
 *
 * @constructor
 */
const TokenBalanceModel = function (params) {
  const oThis = this
  ;

  oThis.erc20ContractAddress = (params.erc20_contract_address || '').toLowerCase();
  oThis.ddbServiceObj = params.ddb_service;
  oThis.shardMgmtObj = oThis.ddbServiceObj.shardManagement();
  oThis.autoScalingObj = params.auto_scaling;

  oThis.shardName = null;
  oThis.entityType = 'tokenBalance';
};

TokenBalanceModel.prototype = {

  /**
   * Allocate
   *
   * @return {promise<result>}
   */
  allocate: async function () {
    const oThis = this
    ;

    let getShardsByTypeParams = {
      entity_type: oThis.entityType,
      shard_type: 'enabled'
    };

    let getShardsByTypeResponse = await oThis.shardMgmtObj.getShardsByType(getShardsByTypeParams);
    if (getShardsByTypeResponse.isFailure()) return Promise.reject(getShardsByTypeResponse);

    let shards = getShardsByTypeResponse.data.items;
    let shardToAssignIndex = new BigNumber(oThis.erc20ContractAddress).mod(new BigNumber(shards.length)).toString(10);

    let shardName = shards[shardToAssignIndex].shardName;

    let assignShardParams = {
      entity_type: oThis.entityType,
      identifier: oThis.erc20ContractAddress,
      shard_name: shardName
    };

    let assignShardResponse = await oThis.shardMgmtObj.assignShard(assignShardParams);
    if (assignShardResponse.isFailure()) return Promise.reject(assignShardResponse);

    return responseHelper.successWithData({});
  },

  /**
   * Allocate
   *
   * @return {promise<result>}
   */
  hasAllocatedShard: async function () {

    const oThis = this
    ;

    return oThis._getShard()
        .then(function() {return responseHelper.successWithData({hasAllocatedShard: true});})
        .catch(function (error) {
          if (responseHelper.isCustomResult(error)) {
            return responseHelper.successWithData({hasAllocatedShard: false});
          } else {
            logger.error(`${__filename}::perform::catch`);
            logger.error(error);
            return responseHelper.error({
              internal_error_identifier: 'l_m_ddb_tb_1',
              api_error_identifier: 'exception',
              debug_options: {},
              error_config: coreConstants.ERROR_CONFIG
            });
          }
        });

  },

  /**
   * Create and register shard for transaction logs entity type
   *
   * @return {promise<result>}
   */
  createAndRegisterShard: async function (shardName) {
    const oThis = this
    ;

    const createTableParams = {
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

    let createTableResponse = await oThis.ddbServiceObj.createTable(createTableParams);
    if (createTableResponse.isFailure()) return Promise.reject(createTableResponse);

    let addShardParams = {
      shard_name: shardName,
      entity_type: oThis.entityType
    };

    let addShardResponse = await oThis.shardMgmtObj.addShard(addShardParams);
    if (addShardResponse.isFailure()) return Promise.reject(addShardResponse);

    let configureShardParams = {
      shard_name: shardName,
      allocation_type: 'enabled'
    };

    let configureShardResponse = await oThis.shardMgmtObj.configureShard(configureShardParams);
    if (configureShardResponse.isFailure()) return Promise.reject(configureShardResponse);

    return responseHelper.successWithData({});
  },

  /**
   * Get balance record
   *
   * @return {promise<result>}
   */
  getBalance: async function (ethereumAddress) {
    const oThis = this
    ;

    await oThis._getShard();

    const bachGetParams = {
      RequestItems: {
        [oThis.shardName]: { Keys: [oThis._keyObj({ethereum_address: ethereumAddress})] }
      }
    };

    let response = await oThis.ddbServiceObj.batchGetItem(bachGetParams);

    if (response.isFailure()) {
      return Promise.reject(responseHelper.error({
        internal_error_identifier:"l_m_tb_1",
        api_error_identifier: "ddb_method_call_error",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      }));
    }

    return responseHelper.successWithData(response);

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
  settle: async function(params){

    const oThis = this
      , unSettledDebitAmount = params['un_settled_debit_amount'] || '0'
      , settleAmount = params['settle_amount'] || '0'
      , responseDbData = {}
    ;

    await oThis._getShard();

    const debitParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj({ethereum_address: params['ethereum_address']}),
      UpdateExpression: "ADD "+ oThis.shortNameFor('unsettled_debits') +" :unsettled_debit_amount, "+ oThis.shortNameFor('settled_balance') +" :amount",
      ExpressionAttributeValues: {
        ":amount": {N: settleAmount},
        ":unsettled_debit_amount": {N: unSettledDebitAmount}
      },
      ReturnValues: "ALL_NEW"
    };

    const updateResponse = await oThis.ddbServiceObj.updateItem(debitParams);
    if(updateResponse.isSuccess() && updateResponse.data && updateResponse.data.Attributes){

      for(var shortKey in updateResponse.data.Attributes){
        if(!oThis.longNameFor(shortKey)) continue;

        responseDbData[oThis.longNameFor(shortKey)] = Object.values(updateResponse.data.Attributes[shortKey])[0]
      }

      if((responseDbData.settled_balance && responseDbData.settled_balance < 0) ||
        (responseDbData.unsettled_debits && responseDbData.unsettled_debits < 0) ){
        return Promise.reject(responseHelper.error({
          internal_error_identifier: 'm_tb_settle_1',
          api_error_identifier: "negative_balance",
          debug_options: {requestParams: JSON.stringify(params), updateResponse: JSON.stringify(updateResponse)},
          error_config: coreConstants.ERROR_CONFIG
        }))
      }
    }

    return Promise.resolve(responseHelper.successWithData(responseDbData));
  },

  /**
   * Handles logic of shorting input param keys
   *
   * @private
   * @param long_name - long name of key
   *
   * @return {String}
   */
  shortNameFor: function (long_name) {
    const longToShortNamesMap = {
      ethereum_address: 'ea',
      erc20_contract_address: 'erc20',
      settled_balance: 'sb',
      unsettled_debits: 'ud',
      updated_timestamp: 'uts'
    };
    return longToShortNamesMap[long_name];
  },

  /**
   * Handles logic of shorting input param keys
   *
   * @private
   * @param long_name - long name of key
   *
   * @return {String}
   */
  longNameFor: function (short_name) {
    const shortToLongNamesMap = {
      ea: 'ethereum_address',
      erc20: 'erc20_contract_address',
      sb: 'settled_balance',
      ud: 'unsettled_debits',
      uts: 'updated_timestamp'
    };
    return shortToLongNamesMap[short_name];
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
   * Get shard
   *
   * @return {promise<result>}
   */
  _getShard: async function () {
    const oThis = this
    ;

    if (oThis.shardName == null) {
      let managedShardParams = {
        entity_type: oThis.entityType,
        identifiers: [oThis.erc20ContractAddress]
      };

      let getManagedShardResponse = await oThis.shardMgmtObj.getManagedShard(managedShardParams);
      if (getManagedShardResponse.isFailure()) return Promise.reject(getManagedShardResponse);

      if(!getManagedShardResponse.data.items[oThis.erc20ContractAddress]) {
        return Promise.reject(getManagedShardResponse);
      }

      oThis.shardName = getManagedShardResponse.data.items[oThis.erc20ContractAddress].shardName;

    }

    return responseHelper.successWithData({});

  }

};

module.exports = TokenBalanceModel;