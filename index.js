/**
 * Index File for openst-storage
 */

"use strict";

const rootPrefix    = '.'
  , version = require(rootPrefix + '/package.json').version
  //, TokenBalanceModel = require(rootPrefix + '/lib/models/dynamodb/token_balance')
  //, TokenBalanceCache = require(rootPrefix + '/services/cache_multi_management/token_balance')
  //, ShardedBaseModel = require(rootPrefix + '/lib/models/dynamodb/base')
  //, entityTypesConst = require(rootPrefix + '/lib/global_constant/entity_types')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

require(rootPrefix + '/lib/models/dynamodb/token_balance');
require(rootPrefix + '/services/cache_multi_management/token_balance');
require(rootPrefix + '/lib/models/dynamodb/base');
require(rootPrefix + '/lib/global_constant/entity_types');

const OpenSTStorage = function (configStrategy) {
  const oThis = this
    , instanceComposer = oThis.ic = new InstanceComposer(configStrategy)
    , TokenBalanceModel = instanceComposer.getLibDDBTokenBalanceModel()
    , TokenBalanceCache = instanceComposer.getDDBTokenBalanceCache()
    , ShardedBaseModel = instanceComposer.getLibDDBBaseModel()
    , entityTypesConst = instanceComposer.getLibGlobalConstantEntityTypes()
  ;

  if (!configStrategy) {
    throw "Mandatory argument configStrategy missing"
  }

  oThis.version = version;

  const model = oThis.model = {};
  model.TokenBalance = TokenBalanceModel;
  model.ShardedBase = ShardedBaseModel;

  const cache = oThis.cache = {};
  cache.TokenBalance = TokenBalanceCache;

  oThis.entityTypesConst = entityTypesConst;
};

InstanceComposer.registerShadowableClass(OpenSTStorage, 'getOpenSTStorage');
module.exports = OpenSTStorage;












// const DynamodbApi  = require(rootPrefix + '/services/dynamodb/api')
// , AutoScalingApi  = require(rootPrefix + '/services/auto_scale/api')

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