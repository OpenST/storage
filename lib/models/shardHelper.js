/**
 * Shard Creation Helper
 *
 * @module lib/models/shardHelper
 *
 */

const rootPrefix = '../..',
  BaseDynamodbModel = require(rootPrefix + '/lib/models/dynamodb/Base'),
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

/**
 * Token Balance Model
 *
 * @augments BaseDynamodbModel
 *
 * @constructor
 */
const DynamodbShardHelper = function(params) {
  const oThis = this;

  oThis.tableSchema = params.table_schema;
  oThis.shardName = params.shard_name;

  BaseDynamodbModel.call(oThis);
};

DynamodbShardHelper.prototype = Object.create(BaseDynamodbModel.prototype);

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

Object.assign(DynamodbShardHelper.prototype, shardHelperSpecificPrototype);

InstanceComposer.registerAsShadowableClass(DynamodbShardHelper, coreConstant.icNameSpace, 'DynamodbShardHelper');

module.exports = DynamodbShardHelper;
