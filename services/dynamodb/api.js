"use strict";

/**
 * DynamoDB service api
 *
 * @module services/dynamodb/api
 *
 */

const rootPrefix  = "../.."
  , DdbBase = require(rootPrefix+'/lib/dynamodb/base')
  , DDBServiceBaseKlass = require(rootPrefix + "/services/dynamodb/base")
  , TableExistServiceApiKlass = require(rootPrefix + '/services/dynamodb/table_exist')
  , WaitForServiceKlass = require(rootPrefix + "/services/dynamodb/wait_for")
  , ShardServiceApiKlass = require(rootPrefix + '/services/dynamodb/shard_management/shard_api')
  , CreateTableMigrationServiceKlass = require(rootPrefix + '/services/dynamodb/create_table_migration')
  , BatchGetItemKlass = require(rootPrefix + '/services/dynamodb/batch_get')
  , BatchWriteItemKlass = require(rootPrefix + '/services/dynamodb/batch_write')
  , UpdateItemKlass = require(rootPrefix + '/services/dynamodb/update_item')
;

/**
 * Constructor for DynamoDB api service class
 *
 * @params {Object} params - DynamoDB connection configurations
 *
 * @constructor
 */
const DynamoDBService = function(params) {
  const oThis = this
  ;

  oThis.ddbObject = new DdbBase(params);
};

DynamoDBService.prototype = {

  /**
   * Create table
   *
   * @params {Object} params - Parameters
   *
   * @return {promise<result>}
   *
   */
  createTable: function(params) {
    const oThis = this
      , createTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'createTable', params, 'raw')
    ;
    return createTableObject.perform();
  },

  /**
   * Run table migration with added features
   *  1. active status check
   *  2. enabling continuous back up
   *  3. enabling auto scaling
   *
   * @params {Object} autoScaleObject - Auto Scaling Object to configure table
   * @params {Object} params - Params as JSON object having further params
   * @params {Object} params.createTableConfig - Create table configurations params as JSON object
   * @params {Object} params.updateContinuousBackupConfig - Update Continuous Backup configurations params as JSON object
   * @params {Object} params.autoScalingConfig - Auto scaling params as JSON Object having further params as JSON object
   * @params {Object} params.autoScalingConfig.registerScalableTargetWrite - Register Scalable Target write configurations params as JSON object
   * @params {Object} params.autoScalingConfig.registerScalableTargetRead - Register Scalable Target read configurations params as JSON object
   * @params {Object} params.autoScalingConfig.putScalingPolicyWrite- Put scaling policy write configurations params as JSON object
   * @params {Object} params.autoScalingConfig.putScalingPolicyRead - Put scaling policy read configurations params as JSON object
   * @return {promise<result>}
   *
   */
  createTableMigration: function(autoScaleObject, params) {
    const oThis = this
      , createTableMigrationObject = new CreateTableMigrationServiceKlass(oThis.ddbObject, autoScaleObject, params, 'raw')
    ;
    return createTableMigrationObject.perform();
  },

  /**
   * Update table
   *
   * @params {Object} params - Params as per dynamo db updateTable api params
   *
   * @return {promise<result>}
   *
   */
  updateTable: function(params) {
    const oThis = this
      , updateTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'updateTable', params, 'raw')
    ;
    return updateTableObject.perform();
  },

  /**
   * Describe table
   *
   * @params {Object} params - Params as per dynamo db describeTable api params
   *
   * @return {promise<result>}
   *
   */
  describeTable: function(params) {
    const oThis = this
      , describeTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'describeTable', params, 'raw')
    ;
    return describeTableObject.perform();
  },

  /**
   * List table
   *
   * @params {Object} params - Params as per dynamo db listTables api params
   *
   * @return {promise<result>}
   *
   */
  listTables: function(params) {
    const oThis = this
      , listTablesObject = new DDBServiceBaseKlass(oThis.ddbObject, 'listTables', params, 'raw')
    ;
    return listTablesObject.perform();
  },

  /**
   * Enables or disables point in time recovery for the specified table
   *
   * @params {Object} params - Params as per dynamo db updateContinuousBackup api params
   *
   * @return {promise<result>}
   *
   */
  updateContinuousBackups: function(params) {
    const oThis = this
      , updateContinuousBackupObject = new DDBServiceBaseKlass(oThis.ddbObject, 'updateContinuousBackups', params, 'raw')
    ;
    return updateContinuousBackupObject.perform();
  },

  /**
   * Delete table
   *
   * @params {Object} params - Params as per dynamo db deleteTable api params
   *
   * @return {promise<result>}
   *
   */
  deleteTable: function(params) {
    const oThis = this
      , deleteTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'deleteTable', params, 'raw')
    ;
    return deleteTableObject.perform();
  },

  /**
   * Batch get
   *
   * @params {Object} params - Params as per dynamo db batchGetItem api params
   * @params {Integer} unprocessedKeysRetryCount - Retry count for unprocessed keys
   *
   * @return {promise<result>}
   *
   */
  batchGetItem: function(params, unprocessedKeysRetryCount) {
    const oThis = this
      , bathGetObject = new BatchGetItemKlass(oThis.ddbObject, params, unprocessedKeysRetryCount, 'dax')
    ;
    return bathGetObject.perform();
  },

  /**
   * Batch write
   *
   * @params {Object} params - Params as per dynamo db batchWriteItem api params
   * @params {Integer} unprocessedItemsRetryCount - Retry count for unprocessed Items
   *
   * @return {promise<result>}
   *
   */
  batchWriteItem: function(params, unprocessedItemsRetryCount) {
    const oThis = this
      , batchWriteObject = new BatchWriteItemKlass(oThis.ddbObject, params, unprocessedItemsRetryCount, 'dax')
    ;
    return batchWriteObject.perform();
  },

  /**
   * Query dynamodb
   *
   * @params {Object} params - Params as per dynamo db query api params
   *
   * @return {promise<result>}
   *
   */
  query: function(params) {
    const oThis = this
      , queryObject = new DDBServiceBaseKlass(oThis.ddbObject, 'query', params, 'dax')
    ;
    return queryObject.perform();
  },

  /**
   * Scan
   *
   * @params {Object} params - Params as per dynamo db scan api params
   *
   * @return {promise<result>}
   *
   */
  scan: function(params) {
    const oThis = this
      , scanObject = new DDBServiceBaseKlass(oThis.ddbObject, 'scan', params, 'dax')
    ;
    return scanObject.perform();
  },

  /**
   * Put item
   *
   * @params {Object} params - Params as per dynamo db putItem api params
   *
   * @return {promise<result>}
   *
   */
  putItem: function(params) {
    const oThis = this
      , putItemObject = new DDBServiceBaseKlass(oThis.ddbObject, 'putItem', params, 'dax')
    ;
    return putItemObject.perform();
  },

  /**
   * Update item
   *
   * @params {Object} params - Params as per dynamo db updateItem api params
   * @params {Integer} retryCount - Retry count for ProvisionedThroughputExceededException exception
   *
   * @return {promise<result>}
   *
   */
  updateItem: function(params, retryCount) {
    const oThis = this
      , updateItemObject = new UpdateItemKlass(oThis.ddbObject, params, retryCount, 'dax')
    ;
    return updateItemObject.perform();
  },

  /**
   * Delete item
   *
   * @params {Object} params - Params as per dynamo db deleteItem api params
   *
   * @return {promise<result>}
   *
   */
  deleteItem: function(params) {
    const oThis = this
      , deleteItemObject = new DDBServiceBaseKlass(oThis.ddbObject, 'deleteItem', params, 'dax')
    ;
    return deleteItemObject.perform();
  },

  /**
   * Check Table exists
   *
   * @params {Object} params - Params as per dynamo db tableExists api params
   *
   * @return {promise<result>}
   *
   */
  tableExistsUsingWaitFor: function(params) {
    const oThis = this
      , tableExistsObject = new WaitForServiceKlass(oThis.ddbObject, 'tableExists', params, 'raw')
    ;
    return tableExistsObject.perform();
  },

  /**
   * Check Table not exists
   *
   * @params {Object} params - Params as per dynamo db tableNotExists api params
   *
   * @return {promise<result>}
   *
   */
  tableNotExistsUsingWaitFor: function(params) {
    const oThis = this
      , tableExistsObject = new WaitForServiceKlass(oThis.ddbObject, 'tableNotExists', params, 'raw')
    ;
    return tableExistsObject.perform();
  },

  /**
   * Check if Table exists using describe table
   *
   * @params {Object} params - Params as per dynamo db tableExists api params
   *
   * @return {promise<result>}
   *
   */
  checkTableExist: function(params) {
    const oThis = this
      , tableExistObject = new TableExistServiceApiKlass(oThis.ddbObject, params, 'raw')
    ;
    return tableExistObject.perform();
  },

  /**
   * It returns Shard service object
   *
   * To run shard service apis
   * runShardMigration()
   * addShard()
   * configureShard()
   * assignShard()
   * hasShard()
   * getShardsByType()
   * getManagedShard()
   */
  shardManagement: function() {
    const oThis = this
    ;
    return new ShardServiceApiKlass(oThis.ddbObject);
  }
};

DynamoDBService.prototype.constructor = DynamoDBService;
module.exports = DynamoDBService;