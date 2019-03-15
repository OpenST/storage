const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  OStStorage = require(rootPrefix + '/index'),
  coreConstant = require(rootPrefix + '/config/coreConstant'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  helper = require(rootPrefix + '/tests/mocha/services/auto_scale/helper');

describe('Create Table', function() {
  let dynamodbApiObject = null;
  let autoScaleObj = null;

  before(async function() {
    this.timeout(1000000);
    // create ostStorage
    const ostStorage = OStStorage.getInstance(testConstants.CONFIG_STRATEGIES);
    dynamodbApiObject = ostStorage.dynamoDBService;
    autoScaleObj = ostStorage.ic.getInstanceFor(coreConstant.icNameSpace, 'autoScaleApiService');

    const params = {
      TableName: testConstants.dummyTestTableName
    };

    const checkTableExistsResponse = await dynamodbApiObject.checkTableExist(params);

    if (checkTableExistsResponse.data.response === true) {
      logger.log(testConstants.dummyTestTableName, 'Table exists . Deleting it....');
      await helper.deleteTable(dynamodbApiObject, params, true);

      logger.info('Waiting for table to get deleted');
      await helper.waitForTableToGetDeleted(dynamodbApiObject, params);
      logger.info('Table got deleted');
    } else {
      logger.log(testConstants.dummyTestTableName, 'Table does not exist.');
    }
  });

  it('should create table successfully', async function() {
    this.timeout(1000000);
    // build create table params
    const response = await helper.createTableMigration(dynamodbApiObject, autoScaleObj);
    assert.isTrue(response.isSuccess(), 'createTableMigration failed');
  });

  after(async function() {
    this.timeout(100000);
    const params = {
      TableName: testConstants.dummyTestTableName
    };
    await helper.deleteTable(dynamodbApiObject, params, true);

    logger.debug('Create Table Mocha Tests Complete');

    logger.log('Waiting for Table get deleted...............');
    await helper.waitForTableToGetDeleted(dynamodbApiObject, params);
  });
});
