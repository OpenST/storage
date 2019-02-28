/**
 * Base Model
 *
 * This is the base class for all models which use sharded tables.
 *
 * @module lib/models/dynamodb/Base
 *
 */

const rootPrefix = '../../..',
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/autoScale/helper');
require(rootPrefix + '/services/dynamodb/api');

/**
 * Base Model Constructor
 *
 * @constructor
 */
const BaseDynamodbModel = function() {};

BaseDynamodbModel.prototype = {
  /**
   * Create shard
   *
   * @return {Promise<result>}
   */
  createShard: async function() {
    const oThis = this,
      ddbServiceObj = oThis.ic().getInstanceFor(coreConstant.icNameSpace, 'dynamoDBApiService');

    let schema = oThis._createTableParams(oThis.shardName);

    let createParams = {
      createTableConfig: schema,
      autoScalingConfig: oThis._getAutoScalingParams(oThis.shardName)
    };

    let createTableResponse = await ddbServiceObj.createTableMigration(createParams);
    if (createTableResponse.isFailure()) return Promise.reject(createTableResponse);

    return responseHelper.successWithData({});
  },

  /**
   * get auto scaling params
   *
   * @return {Object}
   */
  _getAutoScalingParams: function(tableName) {
    const oThis = this,
      autoScaleHelper = oThis.ic().getInstanceFor(coreConstant.icNameSpace, 'autoScaleHelper'),
      resourceId = autoScaleHelper.createResourceId(tableName),
      gsiArray = oThis._createTableParams(tableName).GlobalSecondaryIndexes || [];

    let autoScalingConfig = {};

    autoScalingConfig.registerScalableTargetWrite = autoScaleHelper.createScalableTargetParams(
      resourceId,
      autoScaleHelper.writeCapacityScalableDimension,
      10,
      500
    );

    autoScalingConfig.registerScalableTargetRead = autoScaleHelper.createScalableTargetParams(
      resourceId,
      autoScaleHelper.readCapacityScalableDimension,
      10,
      500
    );

    autoScalingConfig.putScalingPolicyWrite = autoScaleHelper.createPolicyParams(
      tableName,
      resourceId,
      autoScaleHelper.writeCapacityScalableDimension,
      autoScaleHelper.writeMetricType,
      1,
      10,
      50.0
    );

    autoScalingConfig.putScalingPolicyRead = autoScaleHelper.createPolicyParams(
      tableName,
      resourceId,
      autoScaleHelper.readCapacityScalableDimension,
      autoScaleHelper.readMetricType,
      1,
      10,
      50.0
    );

    autoScalingConfig.globalSecondaryIndex = {};

    for (let index = 0; index < gsiArray.length; index++) {
      let gsiIndexName = gsiArray[index].IndexName,
        indexResourceId = autoScaleHelper.createIndexResourceId(tableName, gsiIndexName);

      autoScalingConfig.globalSecondaryIndex[gsiIndexName] = {};

      autoScalingConfig.globalSecondaryIndex[
        gsiIndexName
      ].registerScalableTargetWrite = autoScaleHelper.createScalableTargetParams(
        indexResourceId,
        autoScaleHelper.indexWriteCapacityScalableDimenstion,
        5,
        500
      );

      autoScalingConfig.globalSecondaryIndex[
        gsiIndexName
      ].registerScalableTargetRead = autoScaleHelper.createScalableTargetParams(
        indexResourceId,
        autoScaleHelper.indexReadCapacityScalableDimension,
        5,
        500
      );

      autoScalingConfig.globalSecondaryIndex[gsiIndexName].putScalingPolicyWrite = autoScaleHelper.createPolicyParams(
        tableName,
        indexResourceId,
        autoScaleHelper.indexWriteCapacityScalableDimenstion,
        autoScaleHelper.writeMetricType,
        1,
        10,
        50.0
      );

      autoScalingConfig.globalSecondaryIndex[gsiIndexName].putScalingPolicyRead = autoScaleHelper.createPolicyParams(
        tableName,
        indexResourceId,
        autoScaleHelper.indexReadCapacityScalableDimension,
        autoScaleHelper.readMetricType,
        1,
        10,
        50.0
      );
    }
    return autoScalingConfig;
  },

  /**
   * Handles logic of shorting input param keys
   *
   * @private
   * @param longName - long name of key
   *
   * @return {String}
   */
  shortNameFor: function(longName) {
    const oThis = this;
    return oThis.longToShortNamesMap[longName];
  },

  /**
   * Handles logic of shorting input param keys
   *
   * @private
   * @param shortName - long name of key
   *
   * @return {String}
   */
  longNameFor: function(shortName) {
    const oThis = this;
    return oThis.shortToLongNamesMap[shortName];
  }
};

module.exports = BaseDynamodbModel;
