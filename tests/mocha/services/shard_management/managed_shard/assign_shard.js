"use strict";

// Load external packages
const Chai    = require('chai')
  , assert    = Chai.assert
;

const rootPrefix = "../../../../.."
  , DynamoDbObject = require(rootPrefix + "/index").Dynamodb
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , helper = require(rootPrefix + "/tests/mocha/services/shard_management/helper")
;


const dynamoDbObject = new DynamoDbObject(testConstants.DYNAMODB_CONFIGURATIONS_REMOTE)
  , shardManagementObject = dynamoDbObject.shardManagement()
  , userBalancesShardName = testConstants.shardTableName
  , shouldAutoScale = false
;


const createTestCasesForOptions = function (optionsDesc, options, toAssert, dataToAssert) {
  optionsDesc = optionsDesc || "";
  options = options || {
    invalidShardName: false,
    undefined_force_assignment: true,
    invalidIdentifier: false,
    inValidEntityType: true
  };
  let shardName = userBalancesShardName
    , identifier = "0x1234"
    , entityType = testConstants.shardEntityType
    , forceAssignment = true
  ;

  it(optionsDesc, async function(){

    if (options.invalidShardName) {
      // delete table
      await helper.cleanShardMigrationTables(dynamoDbObject);

      await shardManagementObject.runShardMigration(dynamoDbObject, {}, shouldAutoScale);
    }

    if (options.invalidIdentifier) {
      identifier = undefined;
    }

    if (options.undefined_force_assignment) {
      forceAssignment = undefined;
    }

    if (options.inValidEntityType) {
      entityType = "undefined";
    }

    const response = await shardManagementObject.assignShard({identifier: identifier, entity_type: entityType, shard_name: shardName, force_assignment: forceAssignment});

    logger.log("LOG", response);
    if (toAssert) {
      assert.isTrue(response.isSuccess(), "Success");
      assert.deepEqual(response.data, dataToAssert);
    } else {
      assert.isTrue(response.isFailure(), "Failure");
      assert.equal(response.internalErrorCode, dataToAssert);
    }
  });

};

describe('services/dynamodb/shard_management/managed_shard/assign_shard', function () {

  beforeEach(async function() {

    // delete table
    await helper.cleanShardMigrationTables(dynamoDbObject);

    await shardManagementObject.runShardMigration(dynamoDbObject, {}, shouldAutoScale);

    await shardManagementObject.addShard({shard_name: userBalancesShardName, entity_type: 'userBalances'});
  });

  createTestCasesForOptions("Assign shard adding happy case", {}, true, {});

  createTestCasesForOptions("Assign shard having invalid shard name", {
    invalidShardName: true
  }, false, 's_sm_ms_as_validateParams_4');

  createTestCasesForOptions("Assign shard having invalid identifier", {
    invalidIdentifier: true
  }, false, 's_sm_ms_as_validateParams_1');

  createTestCasesForOptions("Assign shard having invalid entity type", {
    inValidEntityType: true
  }, false, 's_sm_ms_as_validateParams_2');

  createTestCasesForOptions("Assign shard having undefined force assignment", {
    undefined_force_assignment: true
  }, true, {});

  afterEach(async function() {
    // delete table
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});