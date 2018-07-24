const chai = require('chai'),
  assert = chai.assert;

//Load external files
const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Delete Item', function() {
  let openStStorageObject = null;

  before(async function() {
    // get openStStorageObject
    openStStorageObject = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);
    ddb_service = openStStorageObject.ddbServiceObj;

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
  });

  it('should delete item successfully', async function() {
    const insertItemParams = {
      TableName: testConstants.transactionLogTableName,
      Item: {
        tuid: { S: 'shardTableName' },
        cid: { N: '2' },
        C: { S: String(new Date().getTime()) },
        U: { S: String(new Date().getTime()) }
      }
    };
    await helper.putItem(ddb_service, insertItemParams, true);

    const deleteItemParams = {
      TableName: testConstants.transactionLogTableName,
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
      TableName: testConstants.transactionLogTableName,
      Item: {
        tuid: { S: 'shardTableName' },
        cid: { N: '2' },
        C: { S: String(new Date().getTime()) },
        U: { S: String(new Date().getTime()) }
      }
    };
    await helper.putItem(ddb_service, insertItemParams, true);

    const deleteItemParams = {
      TableName: testConstants.transactionLogTableName,
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
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug('Update Table Mocha Tests Complete');
  });
});
