const rootPrefix = '../..'
  , BaseModel = require(rootPrefix + '/lib/models/base')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + '/config/core_constants')
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

  oThis.shardName = null;
  oThis.entityType = 'tokenBalance';

  BaseModel.call(oThis, params);
};

TokenBalanceModel.prototype = Object.create(BaseModel.prototype);

const tokenBalanceModelSpecificPrototype = {

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
  _createTableParams: function () {
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
  }

};

Object.assign(TokenBalanceModel.prototype, tokenBalanceModelSpecificPrototype);

module.exports = TokenBalanceModel;