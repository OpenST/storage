'use strict';

/**
 * DynamoDB service api
 *
 * @module services/dynamodb/api
 *
 */

const rootPrefix = '../..',
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/dynamodb/base');
require(rootPrefix + '/services/dynamodb/Base');
require(rootPrefix + '/services/dynamodb/TableExist');
require(rootPrefix + '/services/dynamodb/WaitFor');
require(rootPrefix + '/services/dynamodb/CreateTableMigration');
require(rootPrefix + '/services/dynamodb/BatchGet');
require(rootPrefix + '/services/dynamodb/BatchWrite');
require(rootPrefix + '/services/dynamodb/RetryQuery');

/**
 * Constructor for DynamoDB api service class
 *
 * @params {Object} params - DynamoDB connection configurations
 *
 * @constructor
 */
const DynamoDBApiService = function() {};

DynamoDBApiService.prototype = {
  /**
   * Create table
   *
   * @params {Object} params - Parameters
   *
   * @return {promise<result>}
   *
   */
  createTable: function(params) {
    const oThis = this,
      DDBServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBase'),
      createTableObject = new DDBServiceBaseKlass('createTable', params, 'raw');
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
  createTableMigration: function(params) {
    const oThis = this,
      CreateTableMigrationServiceKlass = oThis
        .ic()
        .getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceCreateTableMigration'),
      createTableMigrationObject = new CreateTableMigrationServiceKlass(params, 'raw');
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
    const oThis = this,
      DDBServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBase'),
      updateTableObject = new DDBServiceBaseKlass('updateTable', params, 'raw');
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
    const oThis = this,
      DDBServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBase'),
      describeTableObject = new DDBServiceBaseKlass('describeTable', params, 'raw');
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
    const oThis = this,
      DDBServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBase'),
      listTablesObject = new DDBServiceBaseKlass('listTables', params, 'raw');
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
    const oThis = this,
      DDBServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBase'),
      updateContinuousBackupObject = new DDBServiceBaseKlass('updateContinuousBackups', params, 'raw');
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
    const oThis = this,
      DDBServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBase'),
      deleteTableObject = new DDBServiceBaseKlass('deleteTable', params, 'raw');
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
    const oThis = this,
      BatchGetItemKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBatchGetItem'),
      bathGetObject = new BatchGetItemKlass(params, unprocessedKeysRetryCount, 'dax');
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
    const oThis = this,
      BatchWriteItemKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceBatchWriteItem'),
      batchWriteObject = new BatchWriteItemKlass(params, unprocessedItemsRetryCount, 'dax');
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
  query: function(params, retryCount) {
    const oThis = this,
      retryQueryKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceRetryQuery'),
      queryObject = new retryQueryKlass(params, 'query', retryCount, 'dax');
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
  scan: function(params, retryCount) {
    const oThis = this,
      retryQueryKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceRetryQuery'),
      scanObject = new retryQueryKlass(params, 'scan', retryCount, 'dax');
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
  putItem: function(params, retryCount) {
    const oThis = this,
      retryQueryKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceRetryQuery'),
      putItemObject = new retryQueryKlass(params, 'putItem', retryCount, 'dax');
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
    const oThis = this,
      retryQueryKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceRetryQuery'),
      updateItemObject = new retryQueryKlass(params, 'updateItem', retryCount, 'dax');
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
  deleteItem: function(params, retryCount) {
    const oThis = this,
      retryQueryKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceRetryQuery'),
      deleteItemObject = new retryQueryKlass(params, 'deleteItem', retryCount, 'dax');
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
    const oThis = this,
      WaitForServiceKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceWaitFor'),
      tableExistsObject = new WaitForServiceKlass('tableExists', params, 'raw');
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
    const oThis = this,
      WaitForServiceKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceWaitFor'),
      tableExistsObject = new WaitForServiceKlass('tableNotExists', params, 'raw');
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
    const oThis = this,
      TableExistServiceApiKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'DDBServiceTableExist'),
      tableExistObject = new TableExistServiceApiKlass(params, 'raw');
    return tableExistObject.perform();
  }
};

DynamoDBApiService.prototype.constructor = DynamoDBApiService;

InstanceComposer.registerAsObject(DynamoDBApiService, coreConstant.icNameSpace, 'dynamoDBApiService', true);

module.exports = DynamoDBApiService;
