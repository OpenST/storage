/**
 * Shard Creation Helper
 *
 * @module lib/models/shard_helper
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
const ShardHelper = function(params) {
  const oThis = this;

  BaseModel.call(oThis);
};

ShardHelper.prototype = Object.create(BaseModel.prototype);

const shardHelperSpecificPrototype = {};

Object.assign(ShardHelper.prototype, shardHelperSpecificPrototype);

InstanceComposer.registerShadowableClass(ShardHelper, 'getShardHelperKlass');

module.exports = ShardHelper;
