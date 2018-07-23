"use strict";

/**
 * Shard service api
 *
 * @module services/dynamodb/shard_management/shard_api
 *
 */

const rootPrefix  = "../../.."
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

require(rootPrefix + '/services/dynamodb/shard_management/shard_migration');
require(rootPrefix + '/services/dynamodb/shard_management/available_shard/add_shard');
require(rootPrefix + '/services/dynamodb/shard_management/available_shard/configure_shard');
require(rootPrefix + '/services/dynamodb/shard_management/managed_shard/assign_shard');
require(rootPrefix + '/services/dynamodb/shard_management/managed_shard/get_shard_details');
require(rootPrefix + '/services/dynamodb/shard_management/available_shard/get_shard_list');
require(rootPrefix + '/services/dynamodb/shard_management/available_shard/has_shard');

/**
 * Constructor for Shard Service api class
 *
 * @constructor
 */
const ShardServiceApi = function() {};

ShardServiceApi.prototype = {

  /**
   * To run Shard Migration
   *
   * @param {Object} ddbApiObject - DynamoDb Api Object
   *
   * @param {Object} autoScaleApiObj Auto Scaling Api Object
   *
   * @return {*|promise<result>}
   */
  runShardMigration: function(ddbApiObject, autoScaleApiObj) {
    const oThis = this
      , ShardMigrationKlass = oThis.ic().getDDBServiceShardMigration()
    ;
    return new ShardMigrationKlass({ddb_api_object: ddbApiObject,
          auto_scaling_api_object: autoScaleApiObj
        }).perform();
  },

  /**
   *  To add Shard
   *
   * @param {Object} params - Params as JSON object
   *
   * @param {String} params.shard_name - Name of the shard
   *
   * @param {String} params.entity_type - Entity Type of shard
   *
   * Note: Allocation Type will be disabled (It will be dedicated shard).
   *  To enable configure shard api call need to be made
   *
   * @return {*|promise<result>}
   */
  addShard: function(params) {
    const oThis = this
      , AddShardKlass = oThis.ic().getDDBServiceAddShard();
    ;

    return new AddShardKlass(params).perform();
  },

  /**
   * To configure shard
   *
   * @param {Object} params - Params as JSON object
   *
   * @param {String} params.shard_name - Name of the shard
   *
   * @param {enum} params.allocation_type - Allocation type :- if
   *                enabled: Provided shard is available for multiple assignment,
   *                disabled: Provided shard is dedicated shard for single Id
   *
   * @return {*|promise<result>}
   */
  configureShard: function(params) {
    const oThis = this
      , ConfigureShardKlass = oThis.ic().getDDBServiceConfigureShard()
    ;

    return new ConfigureShardKlass(params).perform();
  },

  /**
   * Get Shard list by entity type
   *
   * @param {Object} params - Params as JSON object
   *
   * @param {String} params.entity_type - Entity type of the shard
   *
   * @param {enum} params.shard_type - Shard type :- if
   *                  all: give all available shards
   *                  enabled: Shard is available for multiple assignment,
   *                  disabled: Shard is dedicated for single Id
   *
   * @return {*|promise<result>}
   */
  getShardsByType: function (params) {
    const oThis = this
      , GetShardListKlass = oThis.ic().getDdbShardList()
    ;

    return new GetShardListKlass(params).perform();
  },

  /**
   * To check whether shard name already exist or not.
   *
   * @param {Object} params - Params as JSON object
   *
   * @param {Array} params.shard_names - List of shard names to be queried for existence.
   *
   * @return {*|promise<result>}
   */
  hasShard: function (params) {
    const oThis = this
      , HasShardKlass = oThis.ic().getHasShardInfo()
    ;

    return new HasShardKlass(params).perform();
  },


  /**
   * Assign provided Shard name to given Identifier
   *
   * @param {Object} params - Params as JSON object
   *
   * @param {String} params.identifier - Identifier of shard to be assigned.
   *
   * @param {String} params.entity_type - Entity type of the shard.
   *
   * @param {String} params.shard_name - Name of the Shard
   *
   * @param {Boolean} params.force_assignment - (Optional default: false) Force Assignment to bypass dedicated shard check.
   *                                            Note: It should be used in case dedicated shard is assigned first time.
   *
   * @return {*|promise<result>}
   */
  assignShard: function (params) {
    const oThis = this
      , AssignShardKlass = oThis.ic().getDDBAssignShard()
    ;

    return new AssignShardKlass(params).perform();
  },


  /**
   * It provides Shard details
   *
   * @param {Object} params - Params as JSON object
   *
   * @param {String} params.entity_type - Entity type of the shard to be queried.
   *
   * @param {Array} params.identifiers - List of Identifiers to be queried.
   *
   * @return {*|promise<result>}
   */
  getManagedShard: function (params) {
    const oThis = this
      , GetShardNameKlass = oThis.ic().getDdbShardDetails()
    ;

    return new GetShardNameKlass(params).perform();
  }
};

InstanceComposer.register(ShardServiceApi, 'getShardServiceApi', true);
module.exports = new ShardServiceApi();
