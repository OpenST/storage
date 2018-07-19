const chai = require('chai')
  , assert = chai.assert;

const rootPrefix = "../../../.."
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , helper = require(rootPrefix + "/tests/mocha/services/dynamodb/helper")
;

describe('Delete Table', function() {

  var dynamodbApiObject = null;

  before(async function() {
    // get dynamodbApiObject
    dynamodbApiObject = helper.validateDynamodbApiObject(testConstants.CONFIG_STRATEGIES);
  });

  it('should create table successfully', async function () {
    // build create table params
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
      },
      SSESpecification: {
        Enabled: false
      },
    };
    await helper.createTable(dynamodbApiObject, createTableParams, true);
  });

  it('should update table successfully', async function () {
    // build create table params
    const updateTableParams = {
      TableName: testConstants.transactionLogTableName,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    await helper.updateTable(dynamodbApiObject, updateTableParams, true);
  });

  it('should fail when no update config data is passed', async function () {
    // build create table params
    const updateTableParams = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.updateTable(dynamodbApiObject, updateTableParams, false);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(dynamodbApiObject, deleteTableParams, true);
    logger.debug("Update Table Mocha Tests Complete");
  });


});
