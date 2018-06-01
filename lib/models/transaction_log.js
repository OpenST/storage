const rootPrefix = '../..'
  , BaseModel = require(rootPrefix + '/lib/models/base')
  , util = require(rootPrefix + '/lib/utils')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + '/config/core_constants')
  , transactionLogConst = require(rootPrefix + '/lib/global_constant/transaction_log')
;

const longToShortNamesMap = {
      transaction_hash: 'txh',
      transaction_uuid: 'txu',
      transaction_type: 'tt',
      block_number: 'bn',
      client_id: 'ci',
      client_token_id: 'cti',
      gas_used: 'gu',
      gas_price: 'gp',
      status: 's',
      created_at: 'ca',
      from_uuid: 'fu',
      to_uuid: 'tu',
      action_id: 'ai',
      token_symbol: 'ts',
      post_receipt_process_params: 'prpp',
      commission_percent: 'cp',
      commission_amount_in_wei: 'caiw',
      amount: 'a',
      amount_in_wei: 'aiw',
      to_address: 'ta',
      from_address: 'fa',
      bt_transfer_in_wei: 'btiw',
      transfer_events: 'te',
      error_code: 'ec'
    }
    , shortToLongNamesMap = util.invert(longToShortNamesMap)
    , statuses = {
      '1': transactionLogConst.processingStatus,
      '2': transactionLogConst.completeStatus,
      '3': transactionLogConst.failedStatus,
      '4': transactionLogConst.waitingForMiningStatus
    }
    , chainTypes = {
      '1': transactionLogConst.valueChainType,
      '2': transactionLogConst.utilityChainType
    }
    , transactionTypes = {
      '1': transactionLogConst.tokenTransferTransactionType,
      '2': transactionLogConst.stpTransferTransactionType,
      '3': transactionLogConst.extenralTokenTransferTransactionType
    }
    , invertedStatuses = util.invert(statuses)
    , invertedChainTypes = util.invert(chainTypes)
    , invertedTransactionTypes = util.invert(transactionTypes)
;

/**
 * Transaction Log Model
 *
 * @constructor
 */
const TransactionLogModel = function (params) {
  const oThis = this
  ;

  oThis.clientId = params.client_id;
  oThis.transactionUuid = (params.transaction_uuid || '').toLowerCase();
  oThis.transactionHash = (params.transaction_hash || '').toLowerCase();

  oThis.shardName = null;
  oThis.entityType = 'transactionLog';

  BaseModel.call(oThis, params);

};

TransactionLogModel.prototype = Object.create(BaseModel.prototype);

const transactionLogModelSpecificPrototype = {

  shortToLongNamesMap: shortToLongNamesMap,

  longToShortNamesMap: longToShortNamesMap,

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
  createDbRecord: async function(params) {

    const oThis = this;

    var responseDbData = {};

    await oThis._getShard();

    //TODO: Implement this
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
    const oThis = this;
    return oThis.longToShortNamesMap[long_name];
  },

  /**
   * Handles logic of shorting input param keys
   *
   * @private
   * @param short_name - short name of key
   *
   * @return {String}
   */
  longNameFor: function (short_name) {
    const oThis = this;
    return oThis.shortToLongNamesMap[short_name];
  },

  /**
   * Shard Identifier
   *
   * @return {string}
   */
  _shardIdentifier: function () {
    const oThis = this
    ;

    return oThis.clientId;
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
          AttributeName: oThis.shortNameFor('transaction_uuid'),
          KeyType: "HASH"
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'thash_global_secondary_index',
          KeySchema: [
            {
              AttributeName: oThis.shortNameFor('transaction_hash'),
              KeyType: "HASH"
            }
          ],
          Projection: {
            ProjectionType: "KEYS_ONLY"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        },
      ],
      AttributeDefinitions: [
        { AttributeName: oThis.shortNameFor('transaction_uuid'), AttributeType: "S" },
        { AttributeName: oThis.shortNameFor('transaction_hash'), AttributeType: "S" }
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

Object.assign(TransactionLogModel.prototype, transactionLogModelSpecificPrototype);

module.exports = TransactionLogModel;