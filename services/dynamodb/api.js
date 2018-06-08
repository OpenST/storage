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
  , BatchWriteItemKlass = require(rootPrefix + '/services/dynamodb/batch_write')
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
      , createTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'createTable', params)
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
      , createTableMigrationObject = new CreateTableMigrationServiceKlass(oThis.ddbObject, autoScaleObject, params)
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
      , updateTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'updateTable', params)
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
      , describeTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'describeTable', params)
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
      , listTablesObject = new DDBServiceBaseKlass(oThis.ddbObject, 'listTables', params)
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
      , updateContinuousBackupObject = new DDBServiceBaseKlass(oThis.ddbObject, 'updateContinuousBackups', params)
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
      , deleteTableObject = new DDBServiceBaseKlass(oThis.ddbObject, 'deleteTable', params)
    ;
    return deleteTableObject.perform();
  },

  /**
   * Batch get
   *
   * @params {Object} params - Params as per dynamo db batchGetItem api params
   *
   * @return {promise<result>}
   *
   */
  batchGetItem: function(params) {
    const oThis = this
      , bathGetObject = new DDBServiceBaseKlass(oThis.ddbObject, 'batchGetItem', params)
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
      , batchWriteObject = new BatchWriteItemKlass(oThis.ddbObject, params, unprocessedItemsRetryCount)
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
      , queryObject = new DDBServiceBaseKlass(oThis.ddbObject, 'query', params)
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
      , scanObject = new DDBServiceBaseKlass(oThis.ddbObject, 'scan', params)
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
      , putItemObject = new DDBServiceBaseKlass(oThis.ddbObject, 'putItem', params)
    ;
    return putItemObject.perform();
  },

  /**
   * Update item
   *
   * @params {Object} params - Params as per dynamo db updateItem api params
   *
   * @return {promise<result>}
   *
   */
  updateItem: function(params) {
    const oThis = this
      , updateItemObject = new DDBServiceBaseKlass(oThis.ddbObject, 'updateItem', params)
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
      , deleteItemObject = new DDBServiceBaseKlass(oThis.ddbObject, 'deleteItem', params)
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
      , tableExistsObject = new WaitForServiceKlass(oThis.ddbObject, 'tableExists', params)
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
      , tableExistsObject = new WaitForServiceKlass(oThis.ddbObject, 'tableNotExists', params)
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
      , tableExistObject = new TableExistServiceApiKlass(oThis.ddbObject, params)
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