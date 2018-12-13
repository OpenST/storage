/**
 * Shard Creation Helper
 *
 * @module lib/models/shard_helper
 *
 */

const rootPrefix = '../..',
  BaseModel = require(rootPrefix + '/lib/models/dynamodb/base'),
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

/**
 * Token Balance Model
 *
 * @augments BaseModel
 *
 * @constructor
 */
const ShardHelper = function(params) {
  const oThis = this;

  oThis.tableSchema = params.table_schema;
  oThis.shardName = params.shard_name;

  BaseModel.call(oThis);
};

ShardHelper.prototype = Object.create(BaseModel.prototype);

const shardHelperSpecificPrototype = {
  /**
   * Create table params
   *
   * @return {object}
   */
  _createTableParams: function(shardName) {
    const oThis = this;

    return oThis.tableSchema;
  }
};

Object.assign(ShardHelper.prototype, shardHelperSpecificPrototype);

InstanceComposer.registerAsShadowableClass(
  ShardHelper,
  coreConstants.icNameSpace,
  'getShardHelperKlass'
);

module.exports = ShardHelper;
