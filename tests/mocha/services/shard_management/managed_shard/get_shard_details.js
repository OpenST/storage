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
  , identifier = '0x1234'
  , shardName = testConstants.shardTableName
;



const createTestCasesForOptions = function (optionsDesc, options, toAssert, returnCount, dataToAssert) {
  optionsDesc = optionsDesc || "";
  options = options || {
    inValidEntityType: false,
    inValidId: false
  };
  let entity_type = testConstants.shardEntityType;
  let id = identifier;

  it(optionsDesc, async function(){

    if (options.inValidEntityType) {
      entity_type = "userPrice";
    }

    if (options.inValidId) {
      id = "0x2";
    }

    const response = await shardManagementObject.getManagedShard({entity_type: entity_type, identifiers: [id]});

    logger.info("shardManagementObject Response", JSON.stringify(response));
    if (toAssert) {
      assert.isTrue(response.isSuccess(), "Success");
      assert.equal(Object.keys(response.data).length, returnCount);
      if (returnCount === 1){
        assert.equal(response.data[id].shardName, shardName);
      }
    } else {
      assert.isTrue(response.isFailure(), "Failure");
      assert.equal(response.internalErrorCode, dataToAssert);
    }
  });

};

describe('services/dynamodb/shard_management/managed_shard/get_shard_details', function () {

  before(async function () {

    // delete table
    await helper.cleanShardMigrationTables(dynamoDbObject);

    await shardManagementObject.runShardMigration(dynamoDbObject);

    await shardManagementObject.addShard({shard_name: shardName, entity_type: 'userBalances'});

    await shardManagementObject.addShard({shard_name: shardName, entity_type: 'userBalances'});

    await shardManagementObject.assignShard({identifier: identifier, entity_type: "userBalances" ,shard_name: shardName});

  });

  createTestCasesForOptions("Get shard happy case", {}, true, 1, {});

  createTestCasesForOptions("Get shard details having invalid shard type", {
    inValidEntityType: true
  }, false, 1, "s_sm_as_gsd_validateParams_1");

  createTestCasesForOptions("Get shard details having invalid Id", {
    inValidId: true
  }, true, 0, {});

  after(async function() {
    // delete table
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});