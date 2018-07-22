"use strict";

const rootPrefix  = "../.."
  , utils = require(rootPrefix + '/lib/utils')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

require(rootPrefix + '/config/core_constants');

/**
 * Constructor for available shard global constant class
 *
 * @constructor
 */
const availableShard = function() {};

availableShard.prototype = {

  /**
   * Available shards
   *
   * Column Names
   *
   * */
  SHARD_NAME: "SN",
  ENTITY_TYPE: "ET",
  ALLOCATION_TYPE: "AL",
  CREATED_AT: "C",
  UPDATED_AT: "U",

  /**
   * Allocation type params
   */
  ALLOCATION_TYPES: {'enabled':1, 'disabled': 0},


  /**
   * For shard types filtering
   */
  all: 'all',
  enabled : 'enabled',
  disabled : 'disabled',

  /**
   * Get Name of the available shard table
   *
   * @return {string}
   */
  getTableName: function () {
    const oThis = this
      , coreConstants = oThis.ic().getCoreConstants();
    return coreConstants.DYNAMODB_TABLE_NAME_PREFIX + 'available_shards';
  },

  /**
   * Get Index Name for Entity type and Allocation type
   *
   * @return {string}
   */
  getIndexNameByEntityAllocationType: function () {
    return 'entity-type-allocation-type-index';
  },

  /**
   * Get applicable shard types in available shard table
   *
   * @return {Integer}
   */
  getShardTypes: function () {
    const oThis = this
    ;
    return {[oThis.all]: 2, [oThis.enabled] :1, [oThis.disabled]: 0};
  },

  /**
   * Get reverse mapping for shard types from number constant to string
   *
   * @return {String}
   */
  getInverseShardTypes: function () {
    return utils.invert(this.getShardTypes())
  },
};

InstanceComposer.register(availableShard, 'getLibAvailableShard',true);

module.exports = new availableShard();