/**
 * Index File for openst-storage
 */

"use strict";

const rootPrefix    = '.'
  , DynamodbApi  = require(rootPrefix + '/services/dynamodb/api')
  , AutoScalingApi  = require(rootPrefix + '/services/auto_scale/api')
  , TokenBalanceModel = require(rootPrefix + '/lib/models/dynamodb/token_balance')
  , TokenBalanceCache = require(rootPrefix + '/services/cache_multi_management/token_balance')
  , ShardedBaseModel = require(rootPrefix + '/lib/models/dynamodb/base')
  , EntityTypesConst = require(rootPrefix + '/lib/global_constant/entity_types')
;

// Expose all libs here.
// All classes should begin with Capital letter.
// All instances/objects should begin with small letter.
module.exports = {
  Dynamodb : DynamodbApi
  , AutoScaling : AutoScalingApi
  , TokenBalanceModel: TokenBalanceModel
  , TokenBalanceCache: TokenBalanceCache
  , ShardedBaseModel: ShardedBaseModel
  , StorageEntityTypesConst: EntityTypesConst
};

/*
  Usage:

  OSTStorage = require("./index");
*/