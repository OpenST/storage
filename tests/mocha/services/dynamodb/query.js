const chai = require('chai')
  , assert = chai.assert;

//Load external files
const rootPrefix = "../../../.."
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , helper = require(rootPrefix + "/tests/mocha/services/dynamodb/helper")
;

describe('Query Table', function() {

  let openStStorageObject = null;

  before(async function() {
    // get openStStorageObject
    openStStorageObject = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);
    ddb_service = openStStorageObject.ddbServiceObj;

    // put item
    const createTableParams = {
      TableName : testConstants.transactionLogTableName,
      KeySchema: [
        {
          AttributeName: "tuid",
          KeyType: "HASH"
        },  //Partition key
        {
          AttributeName: "cid",
          KeyType: "RANGE"
        }  //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: "tuid", AttributeType: "S" },
        { AttributeName: "cid", AttributeType: "N" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };
    await helper.createTable(ddb_service, createTableParams, true);

    const insertItemParams = {
      TableName: testConstants.transactionLogTableName,
      Item: {
        tuid: {S: "shardTableName"},
        cid: {N: "2"},
        C: {S: String(new Date().getTime())},
        U: {S: String(new Date().getTime())}
      }
    };
    await helper.putItem(ddb_service, insertItemParams, true);

  });

  it('query table for item successfully', async function () {
    const queryParams = {
      TableName: testConstants.transactionLogTableName,
        ExpressionAttributeValues: {
          ":v1": {
            S: 'shardTableName'
          },
          ":v2": {
            N: '2'
          }
        },
        KeyConditionExpression: "#id = :v1 AND #cid = :v2",
        ExpressionAttributeNames: {"#id": 'tuid', "#cid": 'cid'}
    };
    const resultCount = 1;
    const response = await helper.query(ddb_service, queryParams, true, resultCount);
  });

  it('query table for item with invalid key successfully', async function () {
    const queryParams = {
      TableName: testConstants.transactionLogTableName,
      ExpressionAttributeValues: {
        ":v1": {
          S: 'shardTable'
        },
        ":v2": {
          N: '2'
        }
      },
      KeyConditionExpression: "#id = :v1 AND #cid = :v2",
      ExpressionAttributeNames: {"#id": 'tuid', "#cid": 'cid'}
    };

    const resultCount = 0;
    const response = await helper.query(ddb_service, queryParams, true, resultCount);
  });

  it('query table for item with key only without using sort key unsuccessfully', async function () {
    const queryParams = {
      TableName: testConstants.transactionLogTableName,
      ExpressionAttributeValues: {
        ":v1": {
          S: 'shardTable'
        }
      },
      KeyConditionExpression: "#id = :v1",
      ExpressionAttributeNames: {"#id": 'tuid'}
    };

    const resultCount = 0;
    const response = await helper.query(ddb_service, queryParams, true, resultCount);
  });

  it('query table for item with invalid table name unsuccessfully', async function () {
    const queryParams = {
      TableName: 'invalidTable',
      ExpressionAttributeValues: {
        ":v1": {
          S: 'shardTable'
        },
        ":v2": {
          N: '2'
        }
      },
      KeyConditionExpression: "#id = :v1 AND #cid = :v2",
      ExpressionAttributeNames: {"#id": 'tuid', "#cid": 'cid'}
    };

    const resultCount = 0;
    const response = await helper.query(ddb_service, queryParams, false, resultCount);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(ddb_service, deleteTableParams, true);
    logger.debug("Update Table Mocha Tests Complete");
  });
});