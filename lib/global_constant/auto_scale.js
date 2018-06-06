"use strict";

const rootPrefix  = "../.."
;


const autoScale = {

  readCapacityScalableDimension: 'dynamodb:table:ReadCapacityUnits',
  writeCapacityScalableDimension: 'dynamodb:table:WriteCapacityUnits',
  indexReadCapacityScalableDimension: 'dynamodb:index:ReadCapacityUnits',
  indexWriteCapacityScalableDimenstion: 'dynamodb:index:WriteCapacityUnits',

  readMetricType: "DynamoDBReadCapacityUtilization",
  writeMetricType: "DynamoDBWriteCapacityUtilization",

  /**
   * Create resource Id
   * @param tableName
   * @return {string}
   */
  createResourceId: function(tableName) {
    return 'table/' + tableName;
  },

  /**
   * Create Index resource Id
   * @param tableName
   * @param indexName
   * @return {string}
   */
  createIndexResourceId: function(tableName, indexName) {
    const oThis = this
    ;

    return oThis.createResourceId(tableName) + '/index/' + indexName;
  },

  /**
   * To create Scalable Target Params
   * @param resourceId
   * @param scalableDimension
   * @param maxCapacityValue
   * @return {Object}
   */
  createScalableTargetParams: function (resourceId, scalableDimension, maxCapacityValue) {
    return {
      ResourceId: resourceId, /* required */
      ScalableDimension: scalableDimension,
      ServiceNamespace: 'dynamodb', /* required */
      MaxCapacity: maxCapacityValue,
      MinCapacity: 1,
      RoleARN: 'wrongArn'

    };
  },

  /**
   * To create Scaling Policy Params
   * @param tableName
   * @param resourceId
   * @param scalableDimension
   * @param predefinedMetricType
   * @param targetValue
   * @return {Object}
   */
  createPolicyParams: function (tableName, resourceId, scalableDimension, predefinedMetricType, targetValue) {
    return {
      ServiceNamespace: "dynamodb",
      ResourceId: resourceId,
      ScalableDimension: scalableDimension,
      PolicyName: tableName + "-scaling-policy",
      PolicyType: "TargetTrackingScaling",
      TargetTrackingScalingPolicyConfiguration: {
        PredefinedMetricSpecification: {
          PredefinedMetricType: predefinedMetricType
        },
        ScaleOutCooldown: 1, // seconds
        ScaleInCooldown: 1, // seconds
        TargetValue: targetValue
      }
    };
  }



};

module.exports = autoScale;