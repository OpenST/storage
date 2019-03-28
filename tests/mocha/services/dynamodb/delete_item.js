const chai = require('chai'),
  assert = chai.assert;

//Load external files
const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Delete Item', function() {
  let ostStorage = null;

  before(async function() {
    // get ostStorage
    ostStorage = helper.validateOstStorageObject(testConstants.CONFIG_STRATEGIES);
    ddb_service = ostStorage.dynamoDBService;

    // put item
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
      }
    };
    await helper.createTable(ddb_service, createTableParams, true);
  });

  it('should delete item successfully', async function() {
    const insertItemParams = {
      TableName: testConstants.dummyTestTableName,
      Item: {
        tuid: { S: 'shardTableName' },
        cid: { N: '2' },
        C: { S: String(new Date().getTime()) },
        U: { S: String(new Date().getTime()) }
      }
    };
    await helper.putItem(ddb_service, insertItemParams, true);

    const deleteItemParams = {
      TableName: testConstants.dummyTestTableName,
      Key: {
        tuid: {
          S: 'shardTableName'
        },
        cid: {
          N: '2'
        }
      }
    };
    await helper.deleteItem(ddb_service, deleteItemParams, true);
  });

  it('should delete item successfully with unknown key', async function() {
    const insertItemParams = {
      TableName: testConstants.dummyTestTableName,
      Item: {
        tuid: { S: 'shardTableName' },
        cid: { N: '2' },
        C: { S: String(new Date().getTime()) },
        U: { S: String(new Date().getTime()) }
      }
    };
    await helper.putItem(ddb_service, insertItemParams, true);

    const deleteItemParams = {
      TableName: testConstants.dummyTestTableName,
      Key: {
        tuid: {
          S: 'shardTable'
        },
        cid: {
          N: '2'
        }
      }
    };
    await helper.deleteItem(ddb_service, deleteItemParams, true);
  });

  it('should delete item unsuccessfully with invalid table name', async function() {
    const deleteItemParams = {
      TableName: 'InvalidTableName',
      Key: {
        tuid: {
          S: 'shardTableName'
        },
        cid: {
          N: '2'
        }
      }
    };
    await helper.deleteItem(ddb_service, deleteItemParams, false);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.dummyTestTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
