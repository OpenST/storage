"use strict";

/**
 * Managed Shard Model
 *
 * @module lib/models/dynamodb/managed_shard
 *
 */

const rootPrefix = '../../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger            = require( rootPrefix + "/lib/logger/custom_console_logger")
  , managedShardConst = require(rootPrefix + "/lib/global_constant/managed_shard")
  , utils = require(rootPrefix + '/lib/utils')
;

/**
 * Constructor Managed Shard Model
 *
 * @constructor
 */
const ManagedShard = function() {};

ManagedShard.prototype = {

  // For representation purpose
  columnNameMapping: function(){
    return {
      [managedShardConst.IDENTIFIER]: 'identifier',
      [managedShardConst.ENTITY_TYPE]: 'entity_type',
      [managedShardConst.SHARD_NAME]: 'shard_name',
      [managedShardConst.CREATED_AT]: 'created_at',
      [managedShardConst.UPDATED_AT]: 'updated_at'
    }
  },

  getItem: function(ddbItem) {
    return new Item(ddbItem);
  },

  invertedColumnNameMapping: function(){
    const oThis = this
    ;
    return utils.invert(oThis.columnNameMapping());
  },

  /**
   * Get shard based on identifier and entity type
   *
   * @param {Object} params.ddb_object - dynamo db object
   * @param {String} params.identifiers - identifier
   * @param {String} params.entity_type - entity type
   *
   * @return {Promise<any>}
   *
   */
  getShard: async function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , identifiers = params.identifiers
      , entityType = params.entity_type
      , entityTypeCode = managedShardConst.getSupportedEntityTypes()[entityType]
      , dataResponse = {}
      , keys = []
      , queryParams = {RequestItems: {}}
    ;
    try {
      for (let ind = 0; ind < identifiers.length; ind++) {
        let id = identifiers[ind]
        ;
        keys.push({
          [managedShardConst.IDENTIFIER]: {
            S: String(id)
          },
          [managedShardConst.ENTITY_TYPE]: {
            S: String(entityTypeCode)
          }

        });
      }

      queryParams.RequestItems[managedShardConst.getTableName()] = {Keys: keys, ConsistentRead: true};

      const response = await ddbObject.call('batchGetItem', queryParams);
      if (response.isFailure()) {
        return response;
      }

      const responseArray = response.data.Responses[managedShardConst.getTableName()];

      for (let ind = 0; ind < responseArray.length; ind++) {
        let item = responseArray[ind];
        if (item) {
          dataResponse[identifiers[ind]] = new Item(item);
        }
      }
    } catch (err) {
      logger.error("error in managed_shard :: getShard ", err);
      return responseHelper.error({
        internal_error_identifier:"l_m_ms_getShard_1",
        api_error_identifier: "exception",
        debug_options: {error: err},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    return responseHelper.successWithData(dataResponse);
  },

  /**
   * Assign Shard based on provided identifier
   *
   * @param {Object} params.ddb_object - dynamo db object
   * @param {Array} params.identifier - identifier
   * @param {String} params.identifier - identifier
   * @param {String} params.entity_type - entity type
   * @param {String} params.shard_name - shard name
   *
   * @return {*|promise<result>|Request<DynamoDB.PutItemOutput, AWSError>|{type, required, members}}
   */
  assignShard: function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , identifier = params.identifier
      , entityType = params.entity_type
      , shardName = params.shard_name
      , entityTypeCode = managedShardConst.getSupportedEntityTypes()[entityType]
      , insertItemParams = {
        TableName: managedShardConst.getTableName(),
        Item: {
          [managedShardConst.IDENTIFIER]: {S: identifier},
          [managedShardConst.ENTITY_TYPE]: {S: entityTypeCode},
          [managedShardConst.SHARD_NAME]: {S: shardName},
          [managedShardConst.CREATED_AT]: {S: String(new Date().getTime())},
          [managedShardConst.UPDATED_AT]: {S: String(new Date().getTime())}
        }
      }
    ;

    //Is valid entity type
    if (!entityTypeCode) {
      logger.error("undefined entityType");
      throw "undefined entityType";
    }

    return ddbObject.call('putItem', insertItemParams);
  }
};

/**
 * Entity class to hold data of managed shard
 *
 * @param ddbItem dynamo db item
 *
 * @constructor Item
 */
const Item = function(ddbItem) {
  const oThis = this
  ;
  oThis.ddbItem = ddbItem;
};

const ItemProtoType = {};

Object.defineProperties(ItemProtoType, {

  identifier :{
    get: function() {
      const oThis = this;
      return oThis.ddbItem[managedShardConst.IDENTIFIER]['S'];
    }
  },

  entityType :{
    get : function() {
      const oThis = this;
      return oThis.ddbItem[managedShardConst.ENTITY_TYPE]['S'];
    }
  },

  shardName: {
    get: function () {
      const oThis = this;
      return oThis.ddbItem[managedShardConst.SHARD_NAME]['S'];
    }
  },

  createdAt: {
    get: function () {
      const oThis = this;
      return oThis.ddbItem[managedShardConst.CREATED_AT]['S'];
    }
  },

  updateAt: {
    get :function() {
      const oThis = this;
      return oThis.ddbItem[managedShardConst.UPDATED_AT]['S'];
    }
  }
});

Item.prototype = ItemProtoType;
Item.prototype.getStringObject = function() {
  const oThis = this
  ;
  return JSON.stringify(oThis.ddbItem);
};
Item.prototype.constructor = Item;

module.exports = new ManagedShard();