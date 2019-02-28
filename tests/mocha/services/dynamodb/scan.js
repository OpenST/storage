const chai = require('chai'),
  assert = chai.assert;

//Load external files
const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Scan Table', function() {
  let ostStorage = null;

  before(async function() {
    // get ostStorage
    ostStorage = helper.validateOstStorageObject(testConstants.CONFIG_STRATEGIES);
    ddb_service = ostStorage.dynamoDBService;

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
    await helper.createTable(ddb_service, createTableParams, true);

    const insertItem1Params = {
      TableName: testConstants.transactionLogTableName,
      Item: {
        tuid: { S: 'shardTableName1' },
        cid: { N: '1' },
        C: { S: String(new Date().getTime()) },
        U: { S: String(new Date().getTime()) }
      }
    };
    await helper.putItem(ddb_service, insertItem1Params, true);

    const insertItem2Params = {
      TableName: testConstants.transactionLogTableName,
      Item: {
        tuid: { S: 'shardTableName2' },
        cid: { N: '2' },
        C: { S: String(new Date().getTime()) },
        U: { S: String(new Date().getTime()) }
      }
    };
    await helper.putItem(ddb_service, insertItem2Params, true);
  });

  it('scan table for items successfully', async function() {
    const queryParams = {
      TableName: testConstants.transactionLogTableName,
      ExpressionAttributeValues: {
        ':v1': {
          S: 'shardTableName1'
        },
        ':v2': {
          N: '1'
        }
      },
      FilterExpression: '#id = :v1 AND #cid = :v2',
      ExpressionAttributeNames: { '#id': 'tuid', '#cid': 'cid' }
    };

    const resultCount = 1;
    const response = await helper.scan(ddb_service, queryParams, true, resultCount);
  });

  it('scan table for item with invalid key successfully', async function() {
    const queryParams = {
      TableName: testConstants.transactionLogTableName,
      ExpressionAttributeValues: {
        ':v1': {
          S: 'shardTableNae1'
        },
        ':v2': {
          N: '1'
        }
      },
      FilterExpression: '#id = :v1 AND #cid = :v2',
      ExpressionAttributeNames: { '#id': 'tuid', '#cid': 'cid' }
    };

    const resultCount = 0;
    const response = await helper.scan(ddb_service, queryParams, true, resultCount);
  });

  it('scan table for item with key only without using sort key successfully', async function() {
    const queryParams = {
      TableName: testConstants.transactionLogTableName,
      ExpressionAttributeValues: {
        ':v1': {
          S: 'shardTableName1'
        }
      },
      FilterExpression: '#id = :v1',
      ExpressionAttributeNames: { '#id': 'tuid' }
    };

    const resultCount = 1;
    const response = await helper.scan(ddb_service, queryParams, true, resultCount);
  });

  it('scan table for item with invalid table name unsuccessfully', async function() {
    const queryParams = {
      TableName: 'invalidTable',
      ExpressionAttributeValues: {
        ':v1': {
          S: 'shardTableName1'
        },
        ':v2': {
          N: '1'
        }
      },
      FilterExpression: '#id = :v1 AND #cid = :v2',
      ExpressionAttributeNames: { '#id': 'tuid', '#cid': 'cid' }
    };

    const resultCount = 0;
    const response = await helper.scan(ddb_service, queryParams, false, resultCount);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
