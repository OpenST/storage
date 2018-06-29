"use strict";

const rootPrefix  = "../.."
  , utils = require(rootPrefix + '/lib/utils')
  , coreConstants = require(rootPrefix + '/config/core_constants')

;

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
  CREATED_AT: "C",
  UPDATED_AT: "U",

  /**
   * Get Name of the managed shard table
   *
   * @return {string}
   */
  getTableName: function () {
    return coreConstants.DYNAMODB_TABLE_NAME_PREFIX + 'managed_shards';
  }

};

module.exports = new managedShard();