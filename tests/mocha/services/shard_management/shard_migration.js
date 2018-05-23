"use strict";

// Load external packages
const Chai = require('chai')
  , assert = Chai.assert
;

// Load dependencies package
const rootPrefix = "../../../.."
  , DynamoDbKlass = require(rootPrefix + "/index").Dynamodb
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , managedShardConst = require(rootPrefix + "/lib/global_constant/managed_shard")
  , helper = require(rootPrefix + "/tests/mocha/services/shard_management/helper")
;

const dynamoDbObject = new DynamoDbKlass(testConstants.DYNAMODB_CONFIGURATIONS_REMOTE)
  , shardManagementObject = dynamoDbObject.shardManagement()
;

const createTestCasesForOptions = function (optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || "";
  options = options || {
    availableShard: false,
    managedShard: false
  };

  it(optionsDesc, async function () {
    this.timeout(10000000);
    console.log("deleting tables");
    if (options.availableShard) {
      await dynamoDbObject.createTable(helper.createTableParamsFor(availableShardConst.getTableName()));
    }

    if (options.managedShard) {
      await dynamoDbObject.createTable(helper.createTableParamsFor(managedShardConst.getTableName()));
    }

    console.log("starting runShardMigration");

    const response = await shardManagementObject.runShardMigration(dynamoDbObject);
    if (toAssert) {
      assert.isTrue(response.isSuccess(), "Success");
    } else {
      assert.isTrue(response.isFailure(), "Failure");
    }
  });
};

describe('lib/services/shard_management/shard_migration', function () {

  beforeEach(async function () {
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });

  createTestCasesForOptions("Shard migration happy case", {}, true);
  createTestCasesForOptions("Shard migration available shard table already exists", {
    availableShard: true
  }, false);
  createTestCasesForOptions("Shard migration managed shared table already exists", {
    managedShard: true
  }, false);
  createTestCasesForOptions("Shard migration managed and available share both table already exists", {
    availableShard: true,
    managedShard: true
  }, false);

  afterEach(async function () {
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});