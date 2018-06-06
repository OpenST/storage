"use strict";

/**
 *
 * This class would be used for executing migrations for shard management register.<br><br>
 *
 * @module services/shard_management/shard_migration
 *
 */

const rootPrefix = '../../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , managedShardConst = require(rootPrefix + "/lib/global_constant/managed_shard")
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , autoScaleConst = require(rootPrefix + '/lib/global_constant/auto_scale')
;

/**
 * Constructor to create object of shard migration
 *
 * @constructor
 *
 * @params {Object} params - Parameters
 * @params {Object} params.ddb_api_object - ddb api object
 * @params {Object} params.auto_scaling_api_object - auto scaling api object
 *
 * @return {Object}
 *
 */
const ShardMigration = function (params) {
  const oThis = this
  ;
  oThis.ddbApiObject = params.ddb_api_object;
  oThis.autoScalingApiObject = params.auto_scaling_api_object;
};

ShardMigration.prototype = {

  /**
   * Perform method
   *
   * @return {promise<result>}
   *
   */
  perform: async function () {
    const oThis = this
    ;

    return oThis.asyncPerform()
      .catch(function (err) {
        return responseHelper.error({
          internal_error_identifier: "s_sm_sm_perform_1",
          api_error_identifier: "exception",
          debug_options: {error: err},
          error_config: coreConstants.ERROR_CONFIG
        });
      });
  },

  /**
   * Async Perform
   *
   * @return {Promise<*>}
   */
  asyncPerform: async function () {
    const oThis = this
    ;

    let r = null;
    r = oThis.validateParams();
    logger.debug("ShardMigration.executeShardMigration.validateParams", r);
    if (r.isFailure()) return r;

    r = await oThis.executeShardMigration();
    logger.debug("ShardMigration.executeShardMigration.executeShardMigration", r);
    return r;
  },

  /**
   * Validation of params
   *
   * @return {Promise<any>}
   *
   */
  validateParams: function () {
    const oThis = this
    ;

    if (!oThis.ddbApiObject) {
      return responseHelper.error({
        internal_error_identifier: "d_sm_sm_validateParams_1",
        api_error_identifier: "invalid_ddb_api_object",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    return responseHelper.successWithData({});
  },

  /**
   * Execute the shard migration
   *
   * @return {Promise<any>}
   *
   */
  executeShardMigration: function () {
    const oThis = this
    ;

    return new Promise(async function (onResolve) {
      let r = null;
      try {

        r = await oThis.runAvailableShardMigration();

        if (!r.isFailure()) {
          r = await oThis.runManagedShardMigration();
        }

      } catch (err) {
        r = responseHelper.error({
          internal_error_identifier: "s_am_r_runRegister_1",
          api_error_identifier: "exception",
          debug_options: {error: err},
          error_config: coreConstants.ERROR_CONFIG
        });

      }
      return onResolve(r);
    });

  },

  /**
   * Run CreateAvailableShardMigration
   *
   * @return {Promise<void>}
   *
   */
  runAvailableShardMigration: async function () {
    const oThis = this
    ;

    logger.debug("========ShardMigration.runAvailableShardMigration Started=======");

    let params = {};
    params.createTableConfig = oThis.getAvailableShardsCreateTableParams();
    const tableName = params.createTableConfig.TableName
      , globalSecondaryIndexesArray = params.createTableConfig.GlobalSecondaryIndexes
    ;

    //Check whether table already exists
    let hasTable = await oThis.tableExist(tableName);

    if (hasTable) {
      logger.info("Migration Already done for", tableName);
      return responseHelper.successWithData({});
    }

    params.autoScalingConfig = oThis.getAvailableShardsAutoScalingParams(tableName, globalSecondaryIndexesArray);
    const availableShardsResponse = await oThis.ddbApiObject.createTableMigration(oThis.autoScalingApiObject, params);

    logger.debug(availableShardsResponse);
    if (availableShardsResponse.isFailure()) {
      logger.error("Failure error ", availableShardsResponse);
    }
    logger.debug("========ShardMigration.runAvailableShardMigration Ended=======");
    return availableShardsResponse;
  },

  /**
   * Run CreateManagedShardMigration
   *
   * @return {Promise<void>}
   */
  runManagedShardMigration: async function () {
    const oThis = this
    ;

    logger.debug("========ShardMigration.runManagedShardMigration Started=======");

    let params = {};
    params.createTableConfig = await oThis.getManagedShardsCreateTableParams();
    const tableName = params.createTableConfig.TableName
      , resourceId = 'table/' + tableName
      , arn = "ARN"
    ;

    //Check whether table already exists
    let hasTable = await oThis.tableExist(tableName);
    if (hasTable) {
      logger.info("Migration Already done for", tableName);
      return responseHelper.successWithData({});
    }

    params.autoScalingConfig = oThis.getManagedShardsAutoScalingParams(tableName, arn, resourceId);
    const managedShardsResponse = await oThis.ddbApiObject.createTableMigration(oThis.autoScalingApiObject, params);
    logger.debug(managedShardsResponse);
    if (managedShardsResponse.isFailure()) {
      logger.error("Is Failure having err ", managedShardsResponse);
    }
    logger.debug("========ShardMigration.runManagedShardMigration Ended=======");
    return managedShardsResponse;
  },

  /**
   * get create table params for AvailableShards table
   *
   * @return {Object}
   */
  getAvailableShardsCreateTableParams: function () {
    return {
      TableName: availableShardConst.getTableName(),
      AttributeDefinitions: [
        {
          AttributeName: availableShardConst.SHARD_NAME,
          AttributeType: "S"
        },
        {
          AttributeName: availableShardConst.ENTITY_TYPE,
          AttributeType: "S"
        },
        {
          AttributeName: availableShardConst.ALLOCATION_TYPE,
          AttributeType: "N"
        }
      ],
      KeySchema: [
        {
          AttributeName: availableShardConst.SHARD_NAME,
          KeyType: "HASH"
        }
      ],
      GlobalSecondaryIndexes: [{
        IndexName: availableShardConst.getIndexNameByEntityAllocationType(),
        KeySchema: [
          {
            AttributeName: availableShardConst.ENTITY_TYPE,
            KeyType: 'HASH'
          },
          {
            AttributeName: availableShardConst.ALLOCATION_TYPE,
            KeyType: 'RANGE'
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }

  },

  /**
   * get auto scaling params for AvailableShards table
   *
   * @return {Object}
   */
  getAvailableShardsAutoScalingParams: function (tableName, gsiArray) {
    const oThis = this
      , resourceId = autoScaleConst.createResourceId(tableName)
    ;

    let autoScalingConfig = {};

    autoScalingConfig.registerScalableTargetWrite = autoScaleConst.createScalableTargetParams(resourceId, autoScaleConst.writeCapacityScalableDimension, 1,50);

    autoScalingConfig.registerScalableTargetRead = autoScaleConst.createScalableTargetParams(resourceId, autoScaleConst.readCapacityScalableDimension, 1 ,50);

    autoScalingConfig.putScalingPolicyWrite = autoScaleConst.createPolicyParams(tableName, resourceId, autoScaleConst.writeCapacityScalableDimension, autoScaleConst.writeMetricType, 1, 1, 50.0);

    autoScalingConfig.putScalingPolicyRead = autoScaleConst.createPolicyParams(tableName, resourceId, autoScaleConst.readCapacityScalableDimension, autoScaleConst.readMetricType, 1, 1, 50.0);

    autoScalingConfig.globalSecondaryIndex = {};

    for (let index = 0; index < gsiArray.length; index++) {
      let gsiIndexName = gsiArray[index].IndexName
        , indexResourceId = autoScaleConst.createIndexResourceId(tableName, gsiIndexName)
      ;

      autoScalingConfig.globalSecondaryIndex[gsiIndexName] = {};

      autoScalingConfig.globalSecondaryIndex[gsiIndexName].registerScalableTargetWrite = autoScaleConst.createScalableTargetParams(indexResourceId, autoScaleConst.indexWriteCapacityScalableDimenstion, 1, 20);

      autoScalingConfig.globalSecondaryIndex[gsiIndexName].registerScalableTargetRead = autoScaleConst.createScalableTargetParams(indexResourceId, autoScaleConst.indexReadCapacityScalableDimension, 1, 20);

      autoScalingConfig.globalSecondaryIndex[gsiIndexName].putScalingPolicyWrite = autoScaleConst.createPolicyParams(tableName, indexResourceId, autoScaleConst.indexWriteCapacityScalableDimenstion, autoScaleConst.writeMetricType, 1, 1, 70.0);

      autoScalingConfig.globalSecondaryIndex[gsiIndexName].putScalingPolicyRead = autoScaleConst.createPolicyParams(tableName, indexResourceId, autoScaleConst.indexReadCapacityScalableDimension, autoScaleConst.readMetricType, 1, 1, 70.0);

    }
    return autoScalingConfig;
  },

  /**
   * get create table params for ManagedShards table
   *
   * @return {Object}
   */
  getManagedShardsCreateTableParams: function () {
    return {
      TableName: managedShardConst.getTableName(),
      AttributeDefinitions: [
        {
          AttributeName: managedShardConst.IDENTIFIER,
          AttributeType: "S"
        },
        {
          AttributeName: managedShardConst.ENTITY_TYPE,
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: managedShardConst.IDENTIFIER,
          KeyType: "HASH"
        },
        {
          AttributeName: managedShardConst.ENTITY_TYPE,
          KeyType: "RANGE"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  },

  /**
   * To check table existence in db
   *
   * @param tableName Table Name to be checked
   */
  tableExist: async function (tableName) {
    const oThis = this
    ;

    let listTablesResponse = await oThis.ddbApiObject.listTables({});
    if (listTablesResponse.isFailure()) {
      logger.error("s_dy_sm tableExist api failure");
      return false;
    }
    logger.warn("Tables", listTablesResponse.data.TableNames, " for table", tableName);
    return listTablesResponse.data.TableNames.find(function (tn) {
      return tn === tableName;
    });
  },

  /**
   * get auto scaling params for ManagedShards table
   *
   * @return {Object}
   */
  getManagedShardsAutoScalingParams: function (tableName) {
    const oThis = this
      , resourceId = autoScaleConst.createResourceId(tableName)
    ;

    let autoScalingConfig = {};

    autoScalingConfig.registerScalableTargetWrite = autoScaleConst.createScalableTargetParams(resourceId, autoScaleConst.writeCapacityScalableDimension, 1, 50);

    autoScalingConfig.registerScalableTargetRead = autoScaleConst.createScalableTargetParams(resourceId, autoScaleConst.readCapacityScalableDimension, 1, 50);

    autoScalingConfig.putScalingPolicyWrite = autoScaleConst.createPolicyParams(tableName, resourceId, autoScaleConst.writeCapacityScalableDimension, autoScaleConst.writeMetricType, 1, 1, 50.0);

    autoScalingConfig.putScalingPolicyRead = autoScaleConst.createPolicyParams(tableName, resourceId, autoScaleConst.readCapacityScalableDimension, autoScaleConst.readMetricType, 1, 1, 50.0);

    autoScalingConfig.globalSecondaryIndex = {};

    return autoScalingConfig;
  }
};

module.exports = ShardMigration;
