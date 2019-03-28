const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Describe Dynamodb Table', function() {
  let ostStorage = null;

  before(async function() {
    // get ostStorage
    ostStorage = helper.validateOstStorageObject(testConstants.CONFIG_STRATEGIES);
    ddb_service = ostStorage.dynamoDBService;
  });

  it('should create table successfully', async function() {
    // build create table params
    const createTableParams = {
      TableName: testConstants.dummyTestTableName,
      KeySchema: [
        {
          AttributeName: 'tuid',
          KeyType: 'HASH'
        }, //Partition key
        {
          AttributeName: 'cid',
          KeyType: 'RANGE'
        } //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'tuid', AttributeType: 'S' },
        { AttributeName: 'cid', AttributeType: 'N' },
        { AttributeName: 'thash', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: 'thash_global_secondary_index',
          KeySchema: [
            {
              AttributeName: 'thash',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      SSESpecification: {
        Enabled: false
      }
    };
    await helper.createTable(ddb_service, createTableParams, true);
  });

  it('should describe table successfully', async function() {
    const describeTableParams = {
      TableName: testConstants.dummyTestTableName
    };
    await helper.describeTable(ddb_service, describeTableParams, true);
  });

  it('should fail when table name is not passed', async function() {
    const describeTableParams = {};
    await helper.describeTable(ddb_service, describeTableParams, false);
  });

  after(async function() {
    // build delete table params
    const deleteTableParams = {
      TableName: testConstants.dummyTestTableName
    };

    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
