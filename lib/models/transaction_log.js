const rootPrefix = '../..'
  , BaseModel = require(rootPrefix + '/lib/models/base')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + '/config/core_constants')
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
      transaction_hash: 'txh',
      transaction_uuid: 'txu',
      from_uuid: 'fu',
      to_uuid: 'tu',
      action_id: 'ai',
      token_symbol: 'ts',
      post_receipt_process_params: 'prpp',
      commission_percent: 'cp',
      commission_amount_in_wei: 'caiw',
      amount: 'a',
      amount_in_weis: 'aiw',
      to_address: 'ta',
      from_address: 'fa',
      bt_transfer_in_wei: 'btiw',
      error_code: 'ec'
    };
    return longToShortNamesMap[long_name];
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
    const shortToLongNamesMap = {
      txh: 'transaction_hash',
      txu: 'transaction_uuid'
    };
    return shortToLongNamesMap[short_name];
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