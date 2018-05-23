"use strict";

/**
 * Available Shard Model
 *
 * @module models/dynamodb/available_shard
 *
 */

const rootPrefix = '../../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , managedShardConst = require(rootPrefix + "/lib/global_constant/managed_shard")
  , utils = require(rootPrefix + '/lib/utils')
;

/**
 * Constructor Available Shard Model
 *
 * @constructor
 */
const AvailableShard = function () {
};

AvailableShard.prototype = {

  getItem: function (ddbItem) {
    return new Item(ddbItem);
  },

  // For representation purpose
  columnNameMapping: function () {
    return {
      [availableShardConst.SHARD_NAME]: 'shard_name',
      [availableShardConst.ENTITY_TYPE]: 'entity_type',
      [availableShardConst.ALLOCATION_TYPE]: 'allocation_type',
      [availableShardConst.CREATED_AT]: 'created_at',
      [availableShardConst.UPDATED_AT]: 'updated_at'
    }
  },

  invertedColumnNameMapping: function () {
    const oThis = this
    ;
    return utils.invert(oThis.columnNameMapping());
  },

  /**
   * Run add shard
   *
   * @params {object} params -
   * @param {object} params.ddb_object - dynamodb object
   * @param {string} params.shard_name - shard name
   * @param {string} params.entity_type - entity type of shard
   *
   * @return {Promise<any>}
   *
   */
  addShard: function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , shardName = params.shard_name
      , entityType = params.entity_type
      ;

    return new Promise(async function (onResolve) {
      try {

        logger.debug("=======AddShard.addShard.addShardTableEntry=======");
        const addShardEntryResponse = await oThis.addShardTableEntry(ddbObject, shardName, entityType);
        logger.debug(addShardEntryResponse);
        if (addShardEntryResponse.isFailure()) return addShardEntryResponse;

        return onResolve(responseHelper.successWithData({}));
      } catch (err) {
        return onResolve(responseHelper.error('s_sm_as_as_addShard_1', 'Error adding shard. ' + err));
      }
    });
  },

  /**
   * To add Shard table entry in available shard table
   *
   * @param ddbObject dynamo db object
   * @param shardTableName shard table name
   * @param entityType entity type
   *
   * // By default allocation is disabled so that in run time allocation doesn't happen i.e data doesn't get polluted
   */
  addShardTableEntry: function (ddbObject, shardTableName, entityType) {
    const oThis = this
      , entityTypeCode = managedShardConst.getSupportedEntityTypes()[entityType]
      , dateTime = String(new Date().getTime())
      , insertItemParams = {
        TableName: availableShardConst.getTableName(),
        Item: {
          [availableShardConst.SHARD_NAME]: {S: shardTableName},
          [availableShardConst.ENTITY_TYPE]: {S: entityTypeCode},
          [availableShardConst.ALLOCATION_TYPE]: {N: String(availableShardConst.getShardTypes()[availableShardConst.disabled])},
          [availableShardConst.CREATED_AT]: {S: dateTime},
          [availableShardConst.UPDATED_AT]: {S: dateTime}
        }
      }
    ;

    //Is valid entity type
    if (!entityTypeCode) {
      logger.error("undefined entityType");
      throw "undefined entityType";
    }

    return ddbObject.call('putItem', insertItemParams);
  },

  /**
   * Run configure shard
   *
   * @params {object} params -
   * @param {object} params.ddb_object - dynamo db object
   * @param {string} params.shard_name - Name of the shard
   * @param {string} params.allocation_type - allocation_type string
   *
   * @return {Promise<any>}
   *
   */
  configureShard: function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , shardName = params.shard_name
      , allocationType = params.allocation_type
      , updateItemParam = {
        TableName: availableShardConst.getTableName(),
        Key: {
          [availableShardConst.SHARD_NAME]: {
            S: shardName
          }
        },
        ExpressionAttributeNames: {
          "#alloc": availableShardConst.ALLOCATION_TYPE
        },
        ExpressionAttributeValues: {
          ":t": {
            N: String(availableShardConst.ALLOCATION_TYPES[String(allocationType)])
          }
        },
        ReturnValues: "ALL_NEW",
        UpdateExpression: "SET #alloc = :t"
      }
    ;
    // logger.log('DEBUG', JSON.stringify(updateItemParam));
    return ddbObject.call('updateItem', updateItemParam);
  },

  /**
   * Get shard info
   *
   * @params {object} params -
   * @param {object} params.ddb_object - dynamodb object
   * @param {string} params.shard_name - Name of the shard
   *
   * @return {Promise<any>}
   *
   */
  getShardByName: async function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , shardName = params.shard_name
      , queryParams = {
        TableName: availableShardConst.getTableName(),
        ExpressionAttributeValues: {
          ":val": {
            S: String(shardName)
          }
        },
        KeyConditionExpression: "#sn = :val",
      ExpressionAttributeNames: {
        "#sn": availableShardConst.SHARD_NAME,
        "#et": availableShardConst.ENTITY_TYPE,
        "#al": availableShardConst.ALLOCATION_TYPE
      },
        ProjectionExpression: "#sn, #et, #al",
        ConsistentRead: true
      }
    ;
    const response = await ddbObject.call('query', queryParams);

    if (response.isSuccess() && response.data.Items[0]) {
      let item = oThis.getItem(response.data.Items[0]);
      return responseHelper.successWithData({
        [item.shardName]: {
          [availableShardConst.ENTITY_TYPE]: item.entityType,
          [availableShardConst.ALLOCATION_TYPE]: item.allocationType
        }
      })
    } else {
      return response;
    }
  },

  /**
   * Run has shards
   *
   * @params {object} params -
   * @param {object} params.ddb_object - dynamo db object
   * @param {string} params.shard_names - Name of the shard
   *
   * @return {Promise<any>}
   *
   */
  hasShard: async function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , shardNames = params.shard_names
      , dataResponse = {}
      , keys = []
      , queryParams = {RequestItems: {}}
    ;
    try {
      for (let ind = 0; ind < shardNames.length; ind++) {
        keys.push({
          [availableShardConst.SHARD_NAME]: {
            S: String(shardNames[ind])
          }
        });
        dataResponse[shardNames[ind]] = {has_shard: false};
      }

      queryParams.RequestItems[availableShardConst.getTableName()] = {Keys: keys, ConsistentRead: true};

      const response = await ddbObject.call('batchGetItem', queryParams);

      if (response.isFailure()) {
        return response;
      }
      const responseArray = response.data.Responses[availableShardConst.getTableName()];

      for (let ind = 0; ind < responseArray.length; ind++) {
        let item = oThis.getItem(responseArray[ind]);
        dataResponse[item.shardName]= {has_shard: true}
      }
    } catch (err) {
      logger.error("error in available_shards :: hasShard ", err);
      return responseHelper.error({
        internal_error_identifier:"l_m_as_hasShard_1",
        api_error_identifier: "exception",
        debug_options: {error: err},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    return responseHelper.successWithData(dataResponse);
  },

  /**
   * Run get shards
   *
   * @param {object} params.ddb_object - dynamo db object
   * @param {array} params.ids - ids containing entity type and shard type
   * @param {string} params.ids.entity_type - get entity type
   * @param {object} params.id_value_map - id to hash map
   * @param {string} params.ids.shard_type - get shard type Example :- 'all', 'enabled', 'disabled' (Default 'All')
   *
   * @return {Promise<any>}
   *
   */
  getShardsByEntityAllocation: async function (params) {
    const oThis = this
      , ddbObject = params.ddb_object
      , ids = params.ids
      , idToValueMap = params.id_value_map
      , promiseArray = []
      , dataResponse = {}
    ;

    try {
      for (let ind = 0; ind < ids.length; ind++) {
        let objectKey = ids[ind];
        let object = idToValueMap[objectKey];

        let entityType = managedShardConst.getSupportedEntityTypes()[object.entity_type]
          , keyConditionExpression = "#et = :val1"
          , expressionAttributeExpression = {
            '#et': availableShardConst.ENTITY_TYPE
          }
          , projectionExpression = "#et"
          , shardTypeCode = availableShardConst.getShardTypes()[object.shard_type]
          , expressionAttributeValues = {
            ":val1": {
              S: String(entityType)
            }
          }
        ;

        if (object.shard_type !== availableShardConst.all) {
          expressionAttributeValues[":val2"] = {
            N: String(shardTypeCode)
          };
          keyConditionExpression = keyConditionExpression +  " AND #al = :val2";
          expressionAttributeExpression["#al"] = availableShardConst.ALLOCATION_TYPE;
          projectionExpression = projectionExpression + ", #al";
        }

        let queryParams = {
            TableName: availableShardConst.getTableName(),
            IndexName: availableShardConst.getIndexNameByEntityAllocationType(),
            ExpressionAttributeValues: expressionAttributeValues,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeNames: expressionAttributeExpression,
            ProjectionExpression: projectionExpression,
          };

        promiseArray.push(ddbObject.call('query', queryParams));
      }

      const responseArray = await Promise.all(promiseArray);

      for (let ind = 0; ind < responseArray.length; ind++) {
        let resp = responseArray[ind];
        if (resp.isSuccess()) {
          const itemArray = [];
          for (let pointer = 0 ; pointer < resp.data.Items.length ; pointer++) {
            let itemObject = oThis.getItem(resp.data.Items[pointer]);
            itemArray.push(itemObject);
          }
          dataResponse[ids[ind]] = itemArray;
        }
      }
    } catch (err) {
      logger.error("error in available_shards :: getShardsByEntityAllocation ", err);
      return responseHelper.error({
        internal_error_identifier:"l_m_as_getShardsByEntityAllocation_1",
        api_error_identifier: "exception",
        debug_options: {error: err},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    return responseHelper.successWithData(dataResponse);
  }
};

/**
 * Entity class to hold data of available shard
 * @param ddbItem dynamo db item
 * @constructor Item
 */
const Item = function(ddbItem) {
  const oThis = this
  ;
  oThis.ddbItem = ddbItem;
};

const ItemProtoType = {};

Object.defineProperties(ItemProtoType, {

  shardName: {
    get: function () {
      const oThis = this;
      return oThis.ddbItem[availableShardConst.SHARD_NAME]['S'];
    }
  },

  entityType :{
    get : function() {
      const oThis = this;
      return oThis.ddbItem[availableShardConst.ENTITY_TYPE]['S'];
    }
  },

  allocationType :{
    get: function() {
      const oThis = this;
      return availableShardConst.getInverseShardTypes()[oThis.ddbItem[availableShardConst.ALLOCATION_TYPE]['N']];
    }
  },

  createdAt: {
    get: function () {
      const oThis = this;
      return oThis.ddbItem[availableShardConst.CREATED_AT]['S'];
    }
  },

  updateAt: {
    get :function() {
      const oThis = this;
      return oThis.ddbItem[availableShardConst.UPDATED_AT]['S'];
    }
  }
});

Item.prototype = ItemProtoType;
Item.prototype.constructor = Item;

module.exports = new AvailableShard();