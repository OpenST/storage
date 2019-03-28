const chai = require('chai'),
  assert = chai.assert;

//Load external files
const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Update Item in Table', function() {
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
  });

  it('should update item successfully', async function() {
    const updateItemParam = {
      ExpressionAttributeNames: {
        '#c': 'C'
      },
      ExpressionAttributeValues: {
        ':t': {
          S: '2342'
        }
      },
      Key: {
        tuid: {
          S: 'shardTableName'
        },
        cid: {
          N: '2'
        }
      },
      ReturnValues: 'ALL_NEW',
      TableName: testConstants.dummyTestTableName,
      UpdateExpression: 'SET #c = :t'
    };

    await helper.updateItem(ddb_service, updateItemParam, true);
  });

  it('update item should be unsuccessfully when key type is invalid', async function() {
    const updateItemParam = {
      ExpressionAttributeNames: {
        '#c': 'C'
      },
      ExpressionAttributeValues: {
        ':t': {
          C: '2342'
        }
      },
      Key: {
        tuid: {
          S: 'shardTableName'
        },
        cid: {
          S: '2'
        }
      },
      ReturnValues: 'ALL_NEW',
      TableName: testConstants.dummyTestTableName,
      UpdateExpression: 'SET #c = :t'
    };

    await helper.updateItem(ddb_service, updateItemParam, false);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.dummyTestTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
