/**
 * Shard Helper
 *
 * @module lib/models/dynamodb/shard_helper
 *
 */

const rootPrefix = '../../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  BaseModel = require(rootPrefix + '/lib/models/dynamodb/base');
/**
 * Shard Helper
 *
 * @augments BaseModel
 *
 * @constructor
 */
const ShardHelper = function(entityType, shardIdentifier, shardName, longToShortNamesMap, shortToLongNamesMap) {
  const oThis = this;
  oThis.entityType = entityType;
  oThis.shardIdentifier = shardIdentifier;
  oThis.shardName = shardName || null;
  oThis.longToShortNamesMap = longToShortNamesMap;
  oThis.shortToLongNamesMap = shortToLongNamesMap;

  oThis.tableSchema = null;

  BaseModel.call(oThis);
};

ShardHelper.prototype = Object.create(BaseModel.prototype);

const shardHelperSpecificPrototype = {
  /**
   * Sets table schema
   * @param {Object} Schema for DynamoDB table
   */
  setTableSchema: function(tableSchema) {
    const oThis = this;

    oThis.tableSchema = tableSchema;
  },

  /**
   * Shard Identifier
   *
   * @return {string}
   */
  _shardIdentifier: function() {
    const oThis = this;

    return oThis.shardIdentifier;
  },

  /**
   * Create table params. Returns table schema
   *
   * @return {Object}
   */
  _createTableParams: function(shardName) {
    const oThis = this;

    if (!oThis.tableSchema) {
      throw 'Table Schema is mandatory for this functionality. Please use setTableSchema() to set it.';
    }

    return oThis.tableSchema;
  }
};

Object.assign(ShardHelper.prototype, shardHelperSpecificPrototype);

InstanceComposer.registerShadowableClass(ShardHelper, 'getLibDDBShardHelper');

module.exports = ShardHelper;
