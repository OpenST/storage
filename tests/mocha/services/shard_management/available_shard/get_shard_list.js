"use strict";

// Load external packages
const Chai    = require('chai')
  , assert    = Chai.assert
;

const rootPrefix = "../../../../.."
  , DynamoDbObject = require(rootPrefix + "/index").Dynamodb
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , helper = require(rootPrefix + "/tests/mocha/services/shard_management/helper")
;


const dynamoDbObject = new DynamoDbObject(testConstants.CONFIG_STRATEGIES)
  , shardManagementObject = dynamoDbObject.shardManagement()
  , shardName = testConstants.shardTableName
;



const createTestCasesForOptions = function (optionsDesc, options, toAssert, returnCount) {
  optionsDesc = optionsDesc || "";
  options = options || {
    invalidShardType: false,
    inValidEntityType: false
  };
  let entity_type = testConstants.shardEntityType;

  it(optionsDesc, async function(){
    let shardType = availableShardConst.all;
    if (options.invalidShardType) {
      shardType = "test"
    }
    if (options.inValidEntityType) {
      entity_type = "invalidType"
    }

    const response = await shardManagementObject.getShardsByType({entity_type: entity_type, shard_type: shardType});

    logger.info("response LOG", response.toHash());

    if (toAssert) {
      assert.isTrue(response.isSuccess(), "Success");
      var items = response.data.items;
      assert.exists(items);
      assert.equal(items.length, returnCount);
      if (items.length > 0) {
        logger.info("LOG ShardName", items[0].shardName);
        assert.equal(items[0].shardName, shardName);
        logger.info("LOG EntityType", items[0].entityType);
        assert.equal(items[0].entityType, entity_type);
        logger.info("LOG Allocation Type ", items[0].allocationType);
        assert.equal(items[0].allocationType, availableShardConst.disabled);
        logger.info("LOG created At", items[0].createdAt);
        assert.exists(items[0].createdAt);
        logger.info("LOG Updated At", items[0].updatedAt);
        assert.exists(items[0].updatedAt);
      }
    } else {
      assert.isTrue(response.isFailure(), "Failure");
    }
  });

};

describe('services/shard_management/available_shard/get_shards', function () {

  beforeEach(async function () {
    await helper.cleanShardMigrationTables(dynamoDbObject);
    await shardManagementObject.runShardMigration(dynamoDbObject);

    let entity_type = testConstants.shardEntityType;

    await shardManagementObject.addShard({shard_name: shardName, entity_type: entity_type});
  });

  createTestCasesForOptions("Get shard list adding happy case", {}, true, 1);

  createTestCasesForOptions("Get shard list having invalid shard type", {
    invalidShardType: true
  }, false, 0);

  createTestCasesForOptions("Get shard list having invalid entity type", {
    inValidEntityType: true
  }, true, 0);

  afterEach(async function () {
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});