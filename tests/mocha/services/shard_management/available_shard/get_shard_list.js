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


const dynamoDbObject = new DynamoDbObject(testConstants.DYNAMODB_CONFIGURATIONS_REMOTE)
  , shardManagementObject = dynamoDbObject.shardManagement()
  , shouldAutoScale = false
;



const createTestCasesForOptions = function (optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || "";
  options = options || {
    invalidShardType: false,
  };
  let entity_type = testConstants.shardEntityType;

  it(optionsDesc, async function(){
    let shardType = availableShardConst.disabled;
    if (options.invalidShardType) {
      shardType = "test"
    }
    const response = await shardManagementObject.getShardsByType({entity_type: entity_type, shard_type: shardType});

    logger.log("LOG", response);
    if (toAssert) {
      assert.isTrue(response.isSuccess(), "Success");
      assert.exists(response.data.data);
      assert.equal(response.data.data.length, 1);
    } else {
      assert.isTrue(response.isFailure(), "Failure");
    }
  });

};

describe('services/shard_management/available_shard/get_shards', function () {

  before(async function () {
    await helper.cleanShardMigrationTables(dynamoDbObject);
    await shardManagementObject.runShardMigration(dynamoDbObject, {}, shouldAutoScale);

    let entity_type = testConstants.shardEntityType;
    let shardName = testConstants.shardTableName;

    await shardManagementObject.addShard({shard_name: shardName, entity_type: entity_type});
  });

  createTestCasesForOptions("Get shard list adding happy case", {}, true);

  createTestCasesForOptions("Get shard list having invalid shard type", {
    invalidShardType: true
  }, false);

  after(async function () {
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});