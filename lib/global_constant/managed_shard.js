'use strict';

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  utils = require(rootPrefix + '/lib/utils');

require(rootPrefix + '/config/core_constants');
/**
 * Constructor for managed shard global constant class
 *
 * @constructor
 */
const managedShard = function() {};

managedShard.prototype = {
  /**
   * Managed Shard
   *
   * Column Names
   */
  IDENTIFIER: 'ID',
  ENTITY_TYPE: 'ET',
  SHARD_NAME: 'SN',
  CREATED_AT: 'C',
  UPDATED_AT: 'U',

  /**
   * Get Name of the managed shard table
   *
   * @return {string}
   */
  getTableName: function() {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants();
    return coreConstants.DYNAMODB_TABLE_NAME_PREFIX + 'managed_shards';
  }
};

InstanceComposer.register(managedShard, 'getLibManagedShard', true);

module.exports = new managedShard();
