const rootPrefix = '../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper')
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

  oThis.erc20ContractAddress = params.erc20_contract_address.toLowerCase();
  oThis.ddbServiceObj = params.ddb_service;
  oThis.autoScalingObj = params.auto_scaling;

  oThis.shardName = null;
  oThis.entityType = 'userBalances';
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

    let shardMgmtObj = oThis.ddbServiceObj.shardManagement();

    let getShardsByTypeParams = {
      entity_type: oThis.entityType,
      shard_type: 'enabled'
    };

    let getShardsByTypeResponse = await shardMgmtObj.getShardsByType(getShardsByTypeParams);
    if (getShardsByTypeResponse.isFailure()) return Promise.reject(getShardsByTypeResponse);

    let shards = getShardsByTypeResponse.data.items;
    let shardToAssignIndex = new BigNumber(oThis.erc20ContractAddress).mod(new BigNumber(shards.length)).toString(10);

    let shardName = shards[shardToAssignIndex].shardName;

    let assignShardParams = {
      entity_type: oThis.entityType,
      identifier: oThis.erc20ContractAddress,
      shard_name: shardName
    };

    let assignShardResponse = await shardMgmtObj.assignShard(assignShardParams);
    if (assignShardResponse.isFailure()) return Promise.reject(assignShardResponse);

    return responseHelper.successWithData({});
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

      let shardMgmtObj = oThis.ddbServiceObj.shardManagement();

      let getManagedShardResponse = await shardMgmtObj.getManagedShard(managedShardParams);
      if (getManagedShardResponse.isFailure()) return Promise.reject(getManagedShardResponse);

      if(!getManagedShardResponse.data.items[oThis.erc20ContractAddress]) {
        return Promise.reject(err);
      }

      oThis.shardName = getManagedShardResponse.data.items[oThis.erc20ContractAddress].shardName;
    }

    return responseHelper.successWithData({});
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
          AttributeName: "ethereum_address",
          KeyType: "HASH"
        },
        {
          AttributeName: "erc20_contract_address",
          KeyType: "RANGE"
        }
      ],
      AttributeDefinitions: [
        { AttributeName: "ethereum_address", AttributeType: "S" },
        { AttributeName: "erc20_contract_address", AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      SSESpecification: {
        Enabled: false
      },
    };

    let createTableResponse = await helper.createTable(oThis.ddbServiceObj, createTableParams, true);
    if (createTableResponse.isFailure()) return Promise.reject(createTableResponse);

    let shardMgmtObj = oThis.ddbServiceObj.shardManagement();

    let addShardParams = {
      shard_name: shardName,
      entity_type: oThis.entityType
    };

    let addShardResponse = await shardMgmtObj.addShard(addShardParams);
    if (addShardResponse.isFailure()) return Promise.reject(addShardResponse);

    let configureShardParams = {
      shard_name: shardName,
      allocation_type: 'enabled'
    };

    let configureShardResponse = await shardMgmtObj.configureShard(configureShardParams);
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
        [oThis.shardName]: {
          Keys: [
            {
              ethereum_address: {
                S: ethereumAddress
              },
              erc20_contract_address: {
                S: oThis.erc20ContractAddress
              }
            }
          ]
        }
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
   * Settle balance record
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
    ;

    await oThis._getShard();

    const debitParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj({ethereum_address: params['ethereum_address']}),
      UpdateExpression: "ADD unsettled_debits :unsettled_debit_amount, settled_balance :amount",
      ExpressionAttributeValues: {
        ":amount": {N: settleAmount},
        ":unsettled_debit_amount": {N: unSettledDebitAmount}
      },
      ReturnValues: "ALL_NEW"
    };

    const updateResponse = await oThis.ddbServiceObj.updateItem(debitParams);

    if(updateResponse.isSuccess() && updateResponse.data && updateResponse.data.Attributes){
      if((updateResponse.data.Attributes.settled_balance && updateResponse.data.Attributes.settled_balance.N < 0) ||
        (updateResponse.data.Attributes.unsettled_debits && updateResponse.data.Attributes.unsettled_debits.N < 0) ){

        return Promise.reject(responseHelper.error({
          internal_error_identifier: 'm_tb_settle_1',
          api_error_identifier: "negative_balance",
          debug_options: {requestParams: JSON.stringify(params), updateResponse: JSON.stringify(updateResponse)},
          error_config: coreConstants.ERROR_CONFIG
        }))
      }
    }

    return Promise.resolve(updateResponse);
  },

  /**
   * Primary key of the table.
   *
   * @return {object}
   */
  _keyObj: function (params) {
    const oThis = this;

    return {
      ethereum_address: {
        S: params['ethereum_address']
      },
      erc20_contract_address: {
        S: oThis.erc20ContractAddress
      }
    }
  }

};

module.exports = TokenBalanceModel;