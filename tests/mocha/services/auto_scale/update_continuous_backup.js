const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  OSTStorage = require(rootPrefix + '/index'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper'),
  autoScaleHelper = require(rootPrefix + '/tests/mocha/services/auto_scale/helper');

describe('Create Table', function() {
  let ostStorage = null;
  let dynamodbApiObject = null;

  before(async function() {
    // create ostStorage
    ostStorage = helper.validateOstStorageObject(testConstants.CONFIG_STRATEGIES);
    dynamodbApiObject = ostStorage.dynamoDBService;
  });

  it('should delete table successfully if exists', async function() {
    this.timeout(100000);
    const params = {
      TableName: testConstants.transactionLogTableName
    };
    const checkTableExistsResponse = await dynamodbApiObject.checkTableExist(params);
    if (checkTableExistsResponse.data.response === true) {
      await autoScaleHelper.cleanTestCaseEnvironment(dynamodbApiObject, null);
    }
  });

  it('should create table successfully', async function() {
    this.timeout(100000);
    const returnObject = await autoScaleHelper.createTestCaseEnvironment(dynamodbApiObject, null);
  });

  it('should enable update continuous backup successfully', async function() {
    // build update continuous params
    const enableContinousBackupParams = {
      TableName: testConstants.transactionLogTableName,
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    };
    await helper.updateContinuousBackup(dynamodbApiObject, enableContinousBackupParams, true);
  });

  it('should fail enable update continuous backup if table name not present', async function() {
    // build update continuous params
    const enableContinousBackupParams = {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    };
    await helper.updateContinuousBackup(dynamodbApiObject, enableContinousBackupParams, false);
  });

  after(async function() {
    this.timeout(1000000);
    await autoScaleHelper.cleanTestCaseEnvironment(dynamodbApiObject, null);
    logger.debug('Create Table Mocha Tests Complete');
  });
});
