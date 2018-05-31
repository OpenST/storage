/**
 * Index File for openst-storage
 */

"use strict";

const rootPrefix    = '.'
  , DynamodbApi  = require(rootPrefix + '/services/dynamodb/api')
  , AutoScalingApi  = require(rootPrefix + '/services/auto_scale/api')
  , TokenBalanceModel = require(rootPrefix + '/lib/models/token_balance')
  , TokenBalanceCache = require(rootPrefix + '/services/cache_multi_management/get_balance')
  , TransactionLogModel = require(rootPrefix + '/lib/models/transaction_log')
;

// Expose all libs here.
// All classes should begin with Capital letter.
// All instances/objects should begin with small letter.
module.exports = {
  Dynamodb : DynamodbApi
  , AutoScaling : AutoScalingApi
  , TokenBalanceModel: TokenBalanceModel
  , TokenBalanceCache: TokenBalanceCache
  , TransactionLogModel: TransactionLogModel
};

/*
  Usage:

  OSTStorage = require("./index");
*/