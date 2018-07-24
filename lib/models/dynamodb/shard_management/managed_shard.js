"use strict";

/**
 * Managed Shard Model
 *
 * @module lib/models/dynamodb/shard_management/managed_shard
 *
 */
const rootPrefix = '../../../..'
  , InstanceComposer = require(rootPrefix + '/instance_composer')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , logger            = require( rootPrefix + "/lib/logger/custom_console_logger")
  //, managedShardConst = require(rootPrefix + "/lib/global_constant/managed_shard")
  , utils = require(rootPrefix + '/lib/utils')
;

require(rootPrefix + '/lib/dynamodb/base');
require(rootPrefix + "/config/core_constants");
require(rootPrefix + "/lib/global_constant/managed_shard");
/**
 * Constructor Managed Shard Model
 *
 * @constructor
 */
const ManagedShard = function() {};

ManagedShard.prototype = {

  // For representation purpose
  columnNameMapping: function(){
    const oThis = this
      , managedShardConst = oThis.ic().getLibManagedShard()
    ;
    return {
      [managedShardConst.IDENTIFIER]: 'identifier',
      [managedShardConst.ENTITY_TYPE]: 'entity_type',
      [managedShardConst.SHARD_NAME]: 'shard_name',
      [managedShardConst.CREATED_AT]: 'created_at',
      [managedShardConst.UPDATED_AT]: 'updated_at'
    }
  },

  getItem: function(ddbItem) {
    const oThis = this
      , ManagedShardItem = oThis.ic().getLibModelsManagedShardItem();

    return new ManagedShardItem(ddbItem);
  },

  invertedColumnNameMapping: function(){
    const oThis = this
    ;
    return utils.invert(oThis.columnNameMapping());
  },

  /**
   * Get shard based on identifier and entity type
   *
   * @param {String} params.identifiers - identifier
   * @param {String} params.entity_type - entity type
   *
   * @return {Promise<any>}
   *
   */
  getShard: async function (params) {
    const oThis = this
      , ddbObject = oThis.ic().getLibDynamoDBBase()
      , identifiers = params.identifiers
      , entityType = params.entity_type
      , dataResponse = {}
      , keys = []
      , queryParams = {RequestItems: {}}
      , coreConstants = oThis.ic().getCoreConstants()
      , managedShardConst = oThis.ic().getLibManagedShard()
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
            S: String(entityType)
          }

        });
      }
      queryParams.RequestItems[managedShardConst.getTableName()] = {Keys: keys, ConsistentRead: true};

      const response = await ddbObject.queryDdb('batchGetItem', 'dax', queryParams);
      if (response.isFailure()) {
        return response;
      }

      const responseArray = response.data.Responses[managedShardConst.getTableName()];

      for (let ind = 0; ind < responseArray.length; ind++) {
        let item = responseArray[ind];
        if (item) {
          const ManagedShardItem = oThis.ic().getLibModelsManagedShardItem();
          dataResponse[identifiers[ind]] = new ManagedShardItem(item);
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
   * @param {Array} params.identifier - identifier
   * @param {String} params.identifier - identifier
   * @param {String} params.entity_type - entity type
   * @param {String} params.shard_name - shard name
   *
   * @return {*|promise<result>|Request<DynamoDB.PutItemOutput, AWSError>|{type, required, members}}
   */
  assignShard: function (params) {
    const oThis = this
      , ddbObject = oThis.ic().getLibDynamoDBBase()
      , identifier = params.identifier
      , entityType = params.entity_type
      , shardName = params.shard_name
      , managedShardConst = oThis.ic().getLibManagedShard()
      , insertItemParams = {
        TableName: managedShardConst.getTableName(),
        Item: {
          [managedShardConst.IDENTIFIER]: {S: identifier},
          [managedShardConst.ENTITY_TYPE]: {S: entityType},
          [managedShardConst.SHARD_NAME]: {S: shardName},
          [managedShardConst.CREATED_AT]: {N: String(new Date().getTime())},
          [managedShardConst.UPDATED_AT]: {N: String(new Date().getTime())}
        }
      }
    ;

    return ddbObject.queryDdb('putItem', 'dax', insertItemParams);
  }
};

/**
 * Entity class to hold data of managed shard
 *
 * @param paramDdbItem dynamo db item
 *
 * @constructor ManagedShardItemKlass
 */
const ManagedShardItemKlass = function (paramDdbItem) {
  const oThis = this
    , ddbItem = paramDdbItem;
  const managedShardConst = oThis.ic().getLibManagedShard();
  const defineProperty = function (oThis, propertyName, returnValue) {
    Object.defineProperty(oThis, propertyName, {
      get: function () {
        return returnValue;
      },
      enumerable: true
    });
  };

  defineProperty(oThis, "identifier",
    ddbItem[managedShardConst.IDENTIFIER]['S']
  );

  defineProperty(oThis, "entityType",
    ddbItem[managedShardConst.ENTITY_TYPE]['S']
  );

  defineProperty(oThis, "shardName",
    ddbItem[managedShardConst.SHARD_NAME]['S']
  );

  defineProperty(oThis, "createdAt",
    ddbItem[managedShardConst.CREATED_AT]['N']
  );

  defineProperty(oThis, "updatedAt",
    ddbItem[managedShardConst.UPDATED_AT]['N']
  );
};

ManagedShardItemKlass.prototype.constructor = ManagedShardItemKlass;

InstanceComposer.registerShadowableClass(ManagedShardItemKlass, 'getLibModelsManagedShardItem');
InstanceComposer.register(ManagedShard, 'getLibModelsManagedShard', true);

module.exports = new ManagedShard();