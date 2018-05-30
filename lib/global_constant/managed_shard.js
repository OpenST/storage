"use strict";

const rootPrefix  = "../.."
  , utils = require(rootPrefix + '/lib/utils')

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
    return 'managed_shards';
  },

  /**
   * Get supported entity types of managed shards
   *
   * @return {JSON}
   */
  getSupportedEntityTypes: function () {
    return {
      transactionLogs: 'tl',
      tokenBalances: 'tb'
    }
  },

  /**
   * Get reverse mapping for entity type from short form to actual string
   *
   * @return {JSON}
   */
  getSupportedInverseEntityTypes: function () {
    return utils.invert(this.getSupportedEntityTypes())
  },

};

module.exports = new managedShard();