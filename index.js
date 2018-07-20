/**
 * Index File for openst-storage
 */

"use strict";

const rootPrefix    = '.'
  , version = require(rootPrefix + '/package.json').version
  // , DynamodbApi  = require(rootPrefix + '/services/dynamodb/api')
  // , AutoScalingApi  = require(rootPrefix + '/services/auto_scale/api')
  , TokenBalanceModel = require(rootPrefix + '/lib/models/dynamodb/token_balance')
  , TokenBalanceCache = require(rootPrefix + '/services/cache_multi_management/token_balance')
  , ShardedBaseModel = require(rootPrefix + '/lib/models/dynamodb/base')
  , entityTypesConst = require(rootPrefix + '/lib/global_constant/entity_types')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

const OpenSTStorage = function (configStrategy) {
  const oThis = this
  ;

  if (!configStrategy) {
    throw "Mandatory argument configStrategy missing"
  }

  const instanceComposer = oThis.ic = new InstanceComposer(configStrategy);

  oThis.version = version;

  const model = oThis.model = {};
  model.TokenBalance = TokenBalanceModel;
  model.ShardedBase = ShardedBaseModel;

  const cache = oThis.cache = {};
  cache.TokenBalance = TokenBalanceCache;

  oThis.entityTypesConst = entityTypesConst;
};


module.exports = OpenSTStorage;













// // Expose all libs here.
// // All classes should begin with Capital letter.
// // All instances/objects should begin with small letter.
// module.exports = {
//   Dynamodb : DynamodbApi
//   , AutoScaling : AutoScalingApi
//   , TokenBalanceModel: TokenBalanceModel
//   , TokenBalanceCache: TokenBalanceCache
//   , ShardedBaseModel: ShardedBaseModel
//   , StorageEntityTypesConst: EntityTypesConst
// };

/*
  Usage:

  OSTStorage = require("./index");
*/