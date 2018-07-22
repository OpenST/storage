"use strict";

/**
 *
 * This class would be used for adding new shard.<br><br>
 *
 * @module services/shard_management/available_shard/add_shard
 *
 */

const rootPrefix = '../../../..'
  , InstanceComposer = require(rootPrefix + '/instance_composer')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')


  , HasShardMultiCacheKlass = require(rootPrefix + '/services/cache_multi_management/has_shard')//Exports a function.
  , logger            = require( rootPrefix + "/lib/logger/custom_console_logger")
;

require(rootPrefix + "/config/core_constants");
require( rootPrefix + '/lib/models/dynamodb/shard_management/available_shard');
require(rootPrefix + '/services/cache_multi_management/has_shard');
/**
 * Constructor to create object of Add Shard
 *
 * @constructor
 *
 * @params {Object} params - Parameters
 * @param {String} params.ddb_object - dynamoDbObject
 * @param {String} params.shard_name - Shard Name
 * @param {String} params.entity_type - entity type of shard
 *
 * @return {Object}
 *
 */
const AddShard = function (params) {
  const oThis = this;
  logger.debug("=======addShard.params=======");
  logger.debug(params);

  oThis.params = params;
  oThis.shardName = params.shard_name;
  oThis.ddbObject = params.ddb_object;
  oThis.entityType = params.entity_type;
};

AddShard.prototype = {

  /**
   * Perform method
   *
   * @return {promise<result>}
   *
   */
  perform: async function () {
    const oThis = this
      , coreConstants = oThis.ic().getCoreConstants()
    ;

    return oThis.asyncPerform()
      .catch(function(err){
        return responseHelper.error({
          internal_error_identifier:"s_sm_as_as_perform_1",
          api_error_identifier: "exception",
          debug_options: {error: err},
          error_config: coreConstants.ERROR_CONFIG
        });
      });
  },

  /**
   * Async Perform
   *
   * @return {Promise<*>}
   */
  asyncPerform: async function () {
    const oThis = this
      , availableShard = oThis.ic().getDDBServiceAvailableShard()
    ;

    let r = null;

    r = await oThis.validateParams();
    logger.debug("=======AddShard.validateParams.result=======");
    logger.debug(r);
    if (r.isFailure()) return r;

    r = await availableShard.addShard(oThis.params);
    logger.debug("=======AddShard.addShard.result=======");
    logger.debug(r);

    oThis.clearAnyAssociatedCache();

    return r;
  },

  /**
   * Validation of params
   *
   * @return {Promise<any>}
   *
   */
  validateParams: function () {
    const oThis = this
      , errorCodePrefix = 's_sm_as_as_validateParams_'
      , coreConstants = oThis.ic().getCoreConstants()
    ;

    return new Promise(async function (onResolve) {
      let errorCode = null
        , error_identifier = null
      ;

      if (!oThis.shardName) {
        errorCode = errorCodePrefix + '1';
        error_identifier =  "invalid_shard_name"
      } else if (!oThis.entityType) {
        errorCode = errorCodePrefix + '2';
        error_identifier =  "invalid_entity_type"
      } else {
        return onResolve(responseHelper.successWithData({}));
      }

      logger.debug(errorCode, error_identifier);
      return onResolve(responseHelper.error({
        internal_error_identifier: errorCode,
        api_error_identifier: error_identifier,
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      }));

    });
  },

  /**
   * Clears any Cache associated with "this" object Shard Name
   *
   * @return {*}
   */
  clearAnyAssociatedCache: function () {
    const oThis = this
    ;
    const cacheParams = {
      ddb_object: oThis.ddbObject,
      shard_names: [oThis.shardName]
    };
    return new HasShardMultiCacheKlass(cacheParams).clear();
  }

};

InstanceComposer.registerShadowableClass(AddShard, 'getDDBServiceAddShard');

module.exports = AddShard;