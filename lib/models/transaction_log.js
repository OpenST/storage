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
   * @params {array} rawData
   *
   * @return {promise<result>}
   */
  bulkPutItem: async function(rawData) {

    const oThis = this
        , batchPutLimit = 25
    ;

    let responseDbData = {};

    await oThis._getShard();

    let batchNo = 1;

    while(true) {

      const offset = (batchNo - 1) * batchPutLimit
          , batchedrawData = rawData.slice(offset, batchPutLimit + offset)
          , batchedFormattedData = []
      ;

      if (batchedrawData.length === 0) break;

      for(let i=0; i<batchedrawData.length; i++) {
        let rowData = batchedrawData[i];
        batchedFormattedData.push(oThis._formatDataForPutItem(rowData));
      }

      let batchPutParams = {RequestItems: {}};
      batchPutParams.RequestItems[oThis.shardName] = batchedFormattedData;

      console.log('batchPutParams', batchPutParams);
      let batchPutResponse = await oThis.ddbServiceObj.batchWriteItem(batchPutParams);
      console.log('batchPutResponse', batchPutResponse);

      batchNo = batchNo + 1;

    }

    return Promise.resolve(responseHelper.successWithData({}));

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
  _createTableParams: function (shardName) {
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

    keyObj[oThis.shortNameFor('transaction_uuid')] = { S: params['transaction_uuid'].toLowerCase() };

    return keyObj;

  },

  /**
   * NOTE: Only send keys which are to be inserted in DB. DO NOT send keys with null values
   * Format data for putItem
   *
   * @return {object}
   */
  _formatDataForPutItem: function (rowData) {

    const oThis = this;

    let formattedRowData = oThis._keyObj(rowData);

    // TODO: Handle these 2 columns here
    // post_receipt_process_params: 'prpp',
    // transfer_events: 'te',

    formattedRowData[oThis.shortNameFor('transaction_hash')] = { S: params['transaction_hash'].toLowerCase() };
    formattedRowData[oThis.shortNameFor('transaction_type')] = { N: params['transaction_type'] };
    formattedRowData[oThis.shortNameFor('block_number')] = { N: params['block_number'] };
    formattedRowData[oThis.shortNameFor('client_id')] = { N: params['client_id'] };
    formattedRowData[oThis.shortNameFor('client_token_id')] = { N: params['client_token_id'] };
    formattedRowData[oThis.shortNameFor('gas_used')] = { N: params['gas_used'] };
    formattedRowData[oThis.shortNameFor('gas_price')] = { N: params['gas_price'] };
    formattedRowData[oThis.shortNameFor('status')] = { N: params['status'] };
    formattedRowData[oThis.shortNameFor('created_at')] = { N: params['created_at'] };
    formattedRowData[oThis.shortNameFor('from_uuid')] = { S: params['from_uuid'] };
    formattedRowData[oThis.shortNameFor('to_uuid')] = { S: params['to_uuid'] };
    formattedRowData[oThis.shortNameFor('action_id')] = { N: params['action_id'] };
    formattedRowData[oThis.shortNameFor('token_symbol')] = { S: params['token_symbol'] };
    formattedRowData[oThis.shortNameFor('commission_percent')] = { N: params['commission_percent'] };
    formattedRowData[oThis.shortNameFor('amount')] = { N: params['amount'] };
    formattedRowData[oThis.shortNameFor('amount_in_wei')] = { N: params['amount_in_wei'] };
    formattedRowData[oThis.shortNameFor('to_address')] = { S: params['to_address'] };
    formattedRowData[oThis.shortNameFor('from_address')] = { S: params['from_address'] };
    formattedRowData[oThis.shortNameFor('bt_transfer_in_wei')] = { N: params['bt_transfer_in_wei'] };
    formattedRowData[oThis.shortNameFor('error_code')] = { S: params['error_code'] };

    return {
      PutRequest: {
        Item: formattedRowData
      }
    };

  }

};

Object.assign(TransactionLogModel.prototype, transactionLogModelSpecificPrototype);

module.exports = TransactionLogModel;