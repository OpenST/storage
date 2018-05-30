const rootPrefix = '../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper')
;

/**
 * Token Balance Model
 *
 * @constructor
 */
const TokenBalanceModel = function (params) {
  const oThis = this
  ;

  oThis.clientId = params.client_id;
  oThis.erc20ContractAddress = params.erc20_contract_address;
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
    let shardToAssignIndex = oThis.clientId % shards.length;

    let shardName = shards[shardToAssignIndex].shardName;

    let assignShardParams = {
      entity_type: oThis.entityType,
      identifier: JSON.stringify(oThis.clientId),
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
        identifiers: [oThis.clientId]
      };

      let shardMgmtObj = oThis.ddbServiceObj.shardManagement();

      let getManagedShardResponse = await shardMgmtObj.getManagedShard(managedShardParams);
      if (getManagedShardResponse.isFailure()) return Promise.reject(getManagedShardResponse);

      if(!getManagedShardResponse.data.items[oThis.clientId]) {
        return Promise.reject(err);
      }

      oThis.shardName = getManagedShardResponse.data.items[oThis.clientId].shardName;
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
    // const oThis = this
    // ;
    //
    // const bachGetParams = {
    //   RequestItems: {
    //     [oThis.shardName]: {
    //       Keys: [
    //         {
    //           ethereum_address: {
    //             S: ethereumAddress
    //           },
    //           erc20_contract_address: {
    //             S: oThis.erc20ContractAddress
    //           }
    //         }
    //       ]
    //     }
    //   }
    // };


  },

  /**
   * Get balance record
   *
   * @return {promise<result>}
   */
  pessimisticDebit: async function(params){

    const oThis = this;

    await oThis._getShard();

    const debitParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj(params),
      UpdateExpression: "set unsettled_debits = unsettled_debits + :amount",
      ExpressionAttributeValues: {
        ":amount": {N: params['debitAmount']}
      },
      ReturnValues: "NONE"
    };

    return oThis.ddbServiceObj.updateItem(debitParams);
  },

  /**
   * Settle balance record
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
      //UpdateExpression: "set unsettled_debits = unsettled_debits + :unsettled_debit_amount, settled_balance = settled_balance + :amount",
      ExpressionAttributeValues: {
        ":amount": {N: settleAmount},
        ":unsettled_debit_amount": {N: unSettledDebitAmount}
      },
      ReturnValues: "ALL_NEW"
    };

    return await oThis.ddbServiceObj.updateItem(debitParams);
  },

  /**
   * Settle balance record
   *
   * @return {promise<result>}
   */
  settleReceiver: async function(params){

    const oThis = this;

    await oThis._getShard();

    const debitParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj(params),
      UpdateExpression: "set settled_balance = settled_balance + :amount",
      ExpressionAttributeValues: {
        ":amount": {N: params['settleAmount']},
        ":unsettled_debit_amount": {N: params['unSettledDebitAmount']}
      },
      ReturnValues: "NONE"
    };

    return oThis.ddbServiceObj.updateItem(debitParams);
  },

  /**
   * Get balance record
   *
   * @return {promise<result>}
   */
  unknownTransactionSettle: async function(params){

    const oThis = this;

    await oThis._getShard();

    const debitParams = {
      TableName: oThis.shardName,
      Key: oThis._keyObj(params),
      UpdateExpression: "set settled_balance = settled_balance + :amount",
      ExpressionAttributeValues: {
        ":amount": {N: params['debitAmount']}
      },
      ReturnValues: "NONE"
    };

    return oThis.ddbServiceObj.updateItem(debitParams);
  },

  /**
   * Settle balance record
   *
   * @return {promise<result>}
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