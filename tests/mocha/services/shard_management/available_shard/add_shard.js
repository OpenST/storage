'use strict';

// Load external packages
const Chai = require('chai'),
  assert = Chai.assert;

// Load dependencies package
const rootPrefix = '../../../../..',
  OpenStStorage = require(rootPrefix + '/index'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

require(rootPrefix + '/tests/mocha/services/shard_management/helper');

const openStStorageObject = OpenStStorage.getInstance(testConstants.CONFIG_STRATEGIES),
  dynamoDbObject = openStStorageObject.ddbServiceObj,
  shardManagementObject = dynamoDbObject.shardManagement(),
  helper = openStStorageObject.ic.getShardManagementTestCaseHelper();

const createTestCasesForOptions = function(optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || '';
  options = options || {
    invalidShardName: false,
    wrongEntityType: false
  };

  it(optionsDesc, async function() {
    this.timeout(1000000);
    let shardName = testConstants.shardTableName;
    let entity_type = testConstants.shardEntityType;
    if (options.wrongEntityType) {
      entity_type = '';
    }
    if (options.invalidShardName) {
      shardName = '';
    }
    const response = await shardManagementObject.addShard({ shard_name: shardName, entity_type: entity_type });
    logger.log('LOG', response);
    if (toAssert) {
      assert.isTrue(response.isSuccess(), 'Success');
    } else {
      assert.isTrue(response.isFailure(), 'Failure');
    }
  });
};

describe('services/shard_management/available_shard/add_shard', function() {
  before(async function() {
    this.timeout(1000000);
    await helper.cleanShardMigrationTables(dynamoDbObject);
    await shardManagementObject.runShardMigration(dynamoDbObject);
  });

  createTestCasesForOptions('Shard adding happy case', null, true);

  createTestCasesForOptions(
    'Shard adding empty shard name',
    {
      wrongEntityType: true
    },
    false
  );

  createTestCasesForOptions(
    'Shard adding invalid shard name',
    {
      invalidShardName: true
    },
    false
  );

  after(async function() {
    await helper.cleanShardMigrationTables(dynamoDbObject);
  });
});
