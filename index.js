/**
 * Index File for openst-storage
 */

"use strict";

const rootPrefix    = '.'
  , DynamodbApi  = require(rootPrefix + '/services/dynamodb/api')
  , AutoScalingApi  = require(rootPrefix + '/services/auto_scale/api')
;

// Expose all libs here.
// All classes should begin with Capital letter.
// All instances/objects should begin with small letter.
module.exports = {
  Dynamodb : DynamodbApi
  , AutoScaling : AutoScalingApi
};

/*
  OSTStorage = require("./index");
*/