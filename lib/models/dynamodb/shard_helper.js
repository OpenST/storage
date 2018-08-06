/**
 * Token Balance Model
 *
 * @module lib/models/dynamodb/token_balance
 *
 */

const rootPrefix = '../../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  BaseModel = require(rootPrefix + '/lib/models/dynamodb/base');
/**
 * Token Balance Model
 *
 * @augments BaseModel
 *
 * @constructor
 */
const ShardHelper = function(entityType, shardIdentifier, shardName) {
  const oThis = this;
  oThis.entityType = entityType;
  oThis.shardIdentifier = shardIdentifier;
  oThis.shardName = shardName || null;

  BaseModel.call(oThis);
};

ShardHelper.prototype = Object.create(BaseModel.prototype);

const shardHelperSpecificPrototype = {
  /**
   * Shard Identifier
   *
   * @return {string}
   */
  _shardIdentifier: function() {
    const oThis = this;

    return oThis.shardIdentifier;
  }
};

Object.assign(ShardHelper.prototype, shardHelperSpecificPrototype);

InstanceComposer.registerShadowableClass(ShardHelper, 'getLibDDBShardHelper');

module.exports = ShardHelper;
