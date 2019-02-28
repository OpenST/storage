const chai = require('chai'),
  assert = chai.assert;

//Load external files
const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Check table exists', function() {
  let ostStorage = null;

  before(async function() {
    // create dynamoDbApiObject
    ostStorage = helper.validateOstStorageObject(testConstants.CONFIG_STRATEGIES);

    // put item
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
        { AttributeName: 'cid', AttributeType: 'N' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };
    ddb_service = ostStorage.dynamoDBService;
    await helper.createTable(ddb_service, createTableParams, true);
  });

  it('check table exist successfully', async function() {
    const response = await ddb_service.checkTableExist({ TableName: testConstants.transactionLogTableName });
    assert.equal(response.isSuccess(), true, 'check table exist failed');
  });

  it('check table exist unsuccessfully', async function() {
    const response = await ddb_service.checkTableExist({ TableName: 'unKnown_Table' });
    assert.equal(response.isSuccess(), true, 'check table exist failed');
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
