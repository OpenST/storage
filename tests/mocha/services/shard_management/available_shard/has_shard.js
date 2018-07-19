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


const dynamoDbObject = new DynamoDbObject(testConstants.CONFIG_STRATEGIES)
  , shardManagementObject = dynamoDbObject.shardManagement()
  , shardName = testConstants.shardTableName
;

const createTestCasesForOptions = function (optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || "";
  options = options || {
    hasShard: true,
  };

  it(optionsDesc, async function(){

    if (!options.hasShard) {
      // delete table
      await helper.cleanShardMigrationTables(dynamoDbObject);

      await shardManagementObject.runShardMigration(dynamoDbObject);
    }
    const response = await shardManagementObject.hasShard({shard_names: [shardName]});

    logger.log("LOG", response);
    assert.isTrue(response.isSuccess(), "Success");
    assert.exists(response.data[shardName].has_shard);
    if (toAssert) {
      assert.isTrue(response.data[shardName].has_shard);
    } else {
      assert.isFalse(response.data[shardName].has_shard);
    }
  });
};

describe('services/dynamodb/shard_management/available_shard/has_shard', function () {

  beforeEach(async function () {

    // delete table
    await helper.cleanShardMigrationTables(dynamoDbObject);

    await shardManagementObject.runShardMigration(dynamoDbObject);

    let entity_type = testConstants.shardEntityType;

    await shardManagementObject.addShard({shard_name: shardName, entity_type: entity_type});
  });

  createTestCasesForOptions("has shard case", null, true);

  createTestCasesForOptions("does not have shard case", {
    hasShard: false
  }, false);

  afterEach(async function () {
    // delete table
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});