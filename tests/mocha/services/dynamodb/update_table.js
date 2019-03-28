const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
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
        { AttributeName: 'cid', AttributeType: 'N' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      SSESpecification: {
        Enabled: false
      }
    };
    await helper.createTable(ddb_service, createTableParams, true);
  });

  it('should update table successfully', async function() {
    // build create table params
    const updateTableParams = {
      TableName: testConstants.dummyTestTableName,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    await helper.updateTable(ddb_service, updateTableParams, true);
  });

  it('should fail when no update config data is passed', async function() {
    // build create table params
    const updateTableParams = {
      TableName: testConstants.dummyTestTableName
    };
    await helper.updateTable(ddb_service, updateTableParams, false);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.dummyTestTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
