const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Delete Table', function() {
  let ostStorage = null;

  before(async function() {
    // get ostStorage
    ostStorage = helper.validateOstStorageObject(testConstants.CONFIG_STRATEGIES);

    ddb_service = ostStorage.dynamoDBService;
  });

  it('should create table successfully', async function() {
    // build create table params
    const createTableParams = {
      TableName: testConstants.transactionLogTableName,
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

  it('should delete table successfully', async function() {
    // build delete table params
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };

    await helper.deleteTable(ddb_service, deleteTableParams, true);
  });

  it('should fail when table name is not passed', async function() {
    // build delete table params
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };

    await helper.deleteTable(ddb_service, deleteTableParams, false);
  });

  after(function() {
    logger.debug('Delete Table Mocha Tests Complete');
  });
});
