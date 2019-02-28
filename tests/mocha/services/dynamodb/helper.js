'use strict';

const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  OSTStorage = require(rootPrefix + '/index');

/**
 * Constructor for helper class
 *
 * @constructor
 */
const helper = function() {};

helper.prototype = {
  /**
   * Validate OST Storage Object
   *
   * @params {object} configStrategy - configuration
   *
   * @return {result}
   *
   */
  validateOstStorageObject: function(configStrategy) {
    // validate if the dynamodb configuration is available
    assert.exists(configStrategy, 'configStrategy is neither `null` nor `undefined`');

    // create dynamoDBApi object
    const ostStorage = OSTStorage.getInstance(configStrategy);
    assert.exists(ostStorage, 'ostStorage is not created');
    assert.equal(typeof ostStorage, 'object');
    assert.equal(ostStorage.constructor.name, 'OSTStorage');

    return ostStorage;
  },

  /**
   * Create Table Helper method
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  createTable: async function(ostStorage, params, isResultSuccess) {
    const createTableResponse = await ostStorage.createTable(params);

    if (isResultSuccess) {
      assert.equal(createTableResponse.isSuccess(), true);
      assert.exists(createTableResponse.data.TableDescription, params.TableName);
      // logger.info("Waiting for table to get created.............");
      // await autoScaleHelper.waitForTableToGetCreated(ostStorage, params);
      // logger.info("Table is active");
    } else {
      assert.equal(createTableResponse.isSuccess(), false, 'createTable: successfull, should fail for this case');
    }
    return createTableResponse;
  },

  /**
   * Delete Table Helper method
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  deleteTable: async function(ostStorage, params, isResultSuccess) {
    const deleteTableResponse = await ostStorage.deleteTable(params);

    if (isResultSuccess === true) {
      assert.equal(deleteTableResponse.isSuccess(), true);
      logger.debug('deleteTableResponse.data.TableDescription', deleteTableResponse.data.TableDescription);
      assert.exists(deleteTableResponse.data.TableDescription, params.TableName);
      // logger.info("Waiting for table to get deleted");
      // await autoScaleHelper.waitForTableToGetDeleted(ostStorage, params);
      // logger.info("Table got deleted")
    } else {
      assert.equal(deleteTableResponse.isSuccess(), false);
    }

    return deleteTableResponse;
  },

  /**
   * Update Continuous Backup Table Helper method
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  updateContinuousBackup: async function(ostStorage, params, isResultSuccess) {
    const enableContinousBackupResponse = await ostStorage.updateContinuousBackups(params);
    if (isResultSuccess === true) {
      assert.equal(enableContinousBackupResponse.isSuccess(), true);
      assert.equal(enableContinousBackupResponse.data.ContinuousBackupsStatus, 'ENABLED');
    } else {
      assert.equal(updateTableResponse.isSuccess(), false);
    }
    return enableContinousBackupResponse;
  },

  /**
   * Update Table Helper method
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  updateTable: async function(ostStorage, params, isResultSuccess) {
    const updateTableResponse = await ostStorage.updateTable(params);
    if (isResultSuccess === true) {
      assert.equal(updateTableResponse.isSuccess(), true);
      assert.exists(updateTableResponse.data.TableDescription, params.TableName);
    } else {
      assert.equal(updateTableResponse.isSuccess(), false);
    }
    return updateTableResponse;
  },

  /**
   * Describe Table Helper method
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  describeTable: async function(ostStorage, params, isResultSuccess) {
    const describeTableResponse = await ostStorage.describeTable(params);
    if (isResultSuccess === true) {
      assert.equal(describeTableResponse.isSuccess(), true);
      assert.exists(describeTableResponse.data.Table.TableName, params.TableName);
    } else {
      assert.equal(describeTableResponse.isSuccess(), false);
    }

    return describeTableResponse;
  },

  /**
   * List Tables Helper method
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  listTables: async function(ostStorage, params, isResultSuccess) {
    const listTablesResponse = await ostStorage.listTables(params);
    if (isResultSuccess === true) {
      assert.equal(listTablesResponse.isSuccess(), true);
      assert.include(listTablesResponse.data.TableNames, testConstants.transactionLogTableName);
    } else {
      assert.equal(listTablesResponse.isSuccess(), false);
    }

    return listTablesResponse;
  },

  /**
   * Perform batch get
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch get params
   * @params {object} isResultSuccess - expected result
   * @params {number} resultCount - Result Count
   *
   * @return {result}
   *
   */
  performBatchGetTest: async function(ostStorage, params, isResultSuccess, resultCount) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    // call batch get
    const batchGetResponse = await ostStorage.batchGetItem(params);

    // validate if the table is created
    assert.equal(batchGetResponse.isSuccess(), isResultSuccess, 'batch get failed');

    if (isResultSuccess) {
      // validate batchGet output count
      assert.equal(
        batchGetResponse.data.Responses[testConstants.transactionLogTableName].length,
        resultCount,
        'Result count is not equal'
      );

      // validate return output is object or not
      let returnObject = batchGetResponse.data.Responses[testConstants.transactionLogTableName];
      if (resultCount) {
        assert.typeOf(returnObject[0], 'object');
      }
    }

    // return the response
    return batchGetResponse;
  },

  /**
   * Perform batch write
   *
   * @params {object} ostStorage - DynamoDB Api object
   * @params {object} params - batch write params
   * @params {object} isResultSuccess - expected result
   *
   * @return {result}
   *
   */
  performBatchWriteTest: async function(ostStorage, params, isResultSuccess) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    // call batch get
    const batchWriteResponse = await ostStorage.batchWriteItem(params);

    // validate if the table is created
    assert.equal(batchWriteResponse.isSuccess(), isResultSuccess, 'batch write failed');

    // return the response
    return batchWriteResponse;
  },

  /**
   * put Item
   * @param ostStorage
   * @param params
   * @param isResultSuccess
   * @return {Promise<*|result|DynamoDB.PutItemOutput>}
   */
  putItem: async function(ostStorage, params, isResultSuccess) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    //call put Item
    const putItemResponse = await ostStorage.putItem(params);

    // validate if the insertion is successful or not
    assert.equal(putItemResponse.isSuccess(), isResultSuccess, 'put item failed');

    return putItemResponse;
  },

  /**
   * Delete Item
   * @param ostStorage
   * @param params
   * @param isResultSuccess
   * @return {Promise<*|result|DynamoDB.PutItemOutput>}
   */
  deleteItem: async function(ostStorage, params, isResultSuccess) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    //call put Item
    const deleteItemResponse = await ostStorage.deleteItem(params);

    // validate if the delete is successful or not
    assert.equal(deleteItemResponse.isSuccess(), isResultSuccess, 'delete item failed');

    return deleteItemResponse;
  },

  /**
   * Update Item
   * @param ostStorage
   * @param params
   * @param isResultSuccess
   * @return {Promise<*|DynamoDB.DeleteItemOutput|result>}
   */
  updateItem: async function(ostStorage, params, isResultSuccess) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    //call put Item
    const updateItemResponse = await ostStorage.updateItem(params);

    // validate if the update is successful or not
    assert.equal(updateItemResponse.isSuccess(), isResultSuccess, 'update item failed');

    return updateItemResponse;
  },

  /**
   * query test helper method
   * @param ostStorage
   * @param params
   * @param isResultSuccess
   * @param resultCount
   * @return {Promise<*>}
   */
  query: async function(ostStorage, params, isResultSuccess, resultCount) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    //call query
    const queryResponse = await ostStorage.query(params);

    // validate if the query is successful or not
    assert.equal(queryResponse.isSuccess(), isResultSuccess, 'query failed');

    if (isResultSuccess) {
      // validate query output count
      assert.equal(queryResponse.data.Count, resultCount, 'Result count is not equal');

      // validate return output is object or not
      if (resultCount) {
        assert.typeOf(queryResponse.data.Items[0], 'object');
      }
    }

    return queryResponse;
  },

  /**
   * scan test helper method
   * @param ostStorage
   * @param params
   * @param isResultSuccess
   * @param resultCount
   * @return {Promise<*|DocumentClient.ScanOutput|result|DynamoDB.ScanOutput>}
   */
  scan: async function(ostStorage, params, isResultSuccess, resultCount) {
    assert.exists(ostStorage, 'dynamoDBApiRef is neither `null` nor `undefined`');
    assert.exists(params, 'params is neither `null` nor `undefined`');

    //call scan
    const scanResponse = await ostStorage.scan(params);

    // validate if the scan is successful or not
    assert.equal(scanResponse.isSuccess(), isResultSuccess, 'scan failed');

    if (isResultSuccess) {
      // validate scan output count
      assert.equal(scanResponse.data.Count, resultCount, 'Result count is not equal');

      // validate return output is object or not
      if (resultCount) {
        assert.typeOf(scanResponse.data.Items[0], 'object');
      }
    }

    return scanResponse;
  },

  /**
   * To wait till response
   * @param ostStorage
   * @param func
   * @param params
   * @param toAssert
   * @param retries
   * @return {Promise<void>}
   */
  waitTillTableStatusProvided: async function(ostStorage, func, params, toAssert, retries) {
    const oThis = this,
      WAIT = retries ? retries : 30;
    let count = WAIT;
    let response = null;
    while (count > 0) {
      response = await oThis.waitTillResponse(ostStorage, func, params);
      count -= 1;
    }
  },

  waitTillResponse: async function(ostStorage, func, params) {
    return new Promise(function(resolve) {
      setTimeout(async function() {
        let response = await func.call(ostStorage, params);
        resolve(response);
      }, 1000);
    });
  }
};

module.exports = new helper();
