/* global describe, it */

const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper'),
  testDataSource = require(rootPrefix + '/tests/mocha/services/dynamodb/testdata/batch_get_write_data');

let openStStorageObject = null;

function performTest(ddbServiceObject) {
  describe('Batch write', function() {
    before(async function() {
      this.timeout(100000);
      // get dynamoDB API object
      openStStorageObject = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);

      ddb_service = ddbServiceObject;

      // check if table exists
      const checkTableExistsResponse = await ddb_service.checkTableExist(testDataSource.DELETE_TABLE_DATA);
      if (checkTableExistsResponse.data.response === true) {
        // delete if table exists
        await helper.deleteTable(ddb_service, testDataSource.DELETE_TABLE_DATA, true);
      }

      // create table for the test
      await helper.createTable(ddb_service, testDataSource.CREATE_TABLE_DATA, true);
    });

    it('should fail batch write when number of items = 0', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(0);
      await helper.performBatchWriteTest(ddb_service, batchWriteParams, false);
    });

    it('should pass batch write when number of items = 1', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(1);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);
    });

    it('should pass batch write when number of items = 5', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(5);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);
    });
    it('should pass batch write when number of items = 25', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(25);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);
    });
    it('should fail batch write when number of items > 25', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(26);
      await helper.performBatchWriteTest(ddb_service, batchWriteParams, false);
    });

    // size related tests

    after(async function() {
      this.timeout(100000);
      // runs after all tests in this block
      await helper.deleteTable(ddb_service, testDataSource.DELETE_TABLE_DATA, true);
    });
  });
}

function performMultipleTest(ddbServiceObject1, ddbServiceObject2) {
  describe('Batch Multiple Get', function() {
    before(async function() {
      this.timeout(100000);

      ddb_service = ddbServiceObject1;

      ddb_service2 = ddbServiceObject2;

      // check if table exists
      const checkTableExistsResponse = await ddb_service.checkTableExist(testDataSource.DELETE_TABLE_DATA);
      if (checkTableExistsResponse.data.response === true) {
        // delete if table exists
        await helper.deleteTable(ddb_service, testDataSource.DELETE_TABLE_DATA, true);
      }

      const checkTableExistsResponse2 = await ddb_service2.checkTableExist(testDataSource.DELETE_TABLE_DATA);
      if (checkTableExistsResponse2.data.response === true) {
        // delete if table exists
        await helper.deleteTable(ddb_service2, testDataSource.DELETE_TABLE_DATA, true);
      }

      // create table for the test
      const checkTableCreatedResponse1 = await helper.createTable(ddb_service, testDataSource.CREATE_TABLE_DATA, true);

      const checkTableCreatedResponse2 = await helper.createTable(ddb_service2, testDataSource.CREATE_TABLE_DATA, true);
    });

    it('should fail batch write when number of items = 0', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(0);
      await helper.performBatchWriteTest(ddb_service, batchWriteParams, false);
    });

    it('should fail batch write when number of items = 0', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(0);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service2, batchWriteParams, false);
    });

    it('should pass batch write when number of items = 1 also data should be written only on first database', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteDataBasedOnParam(1);
      console.log('123456654', JSON.stringify(batchWriteParams));
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);

      //Happy case
      const batchGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
              {
                tuid: {
                  S: 'tuid_0'
                },
                cid: {
                  N: '0'
                }
              }
            ]
          }
        }
      };
      const returnCount = 1;
      const batchGetResponse = await helper.performBatchGetTest(ddb_service, batchGetParams, true, returnCount);

      //Checking the second db. Same data should not be present in the second db instance.
      const returnCount2 = 0;
      const batchGetResponse2 = await helper.performBatchGetTest(ddb_service2, batchGetParams, true, returnCount2);
    });

    it('should pass batch write when number of items = 1 also data should be written only on second database', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteDataBasedOnParam_2(1);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service2, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);

      //Happy case
      const batchGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
              {
                tuid: {
                  S: 'tuid_4'
                },
                cid: {
                  N: '4'
                }
              }
            ]
          }
        }
      };
      const returnCount2 = 1;
      const batchGetResponse2 = await helper.performBatchGetTest(ddb_service2, batchGetParams, true, returnCount2);

      //Checking the first db. It should not have the values inserted in 2nd db.
      const returnCount = 0;
      const batchGetResponse = await helper.performBatchGetTest(ddb_service, batchGetParams, true, returnCount);
    });

    it('should pass batch write when number of items = 5 also data should be written only on first database', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteDataBasedOnParam(5);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);

      const batchGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
              {
                tuid: {
                  S: 'tuid_0'
                },
                cid: {
                  N: '0'
                }
              },
              {
                tuid: {
                  S: 'tuid_1'
                },
                cid: {
                  N: '1'
                }
              },
              {
                tuid: {
                  S: 'tuid_2'
                },
                cid: {
                  N: '2'
                }
              },
              {
                tuid: {
                  S: 'tuid_3'
                },
                cid: {
                  N: '3'
                }
              },
              {
                tuid: {
                  S: 'tuid_4'
                },
                cid: {
                  N: '4'
                }
              }
            ]
          }
        }
      };

      const returnCount = 5;
      const batchGetResponse = await helper.performBatchGetTest(ddb_service, batchGetParams, true, returnCount);

      const returnCount2 = 1;
      const batchGetResponse2 = await helper.performBatchGetTest(ddb_service2, batchGetParams, true, returnCount2);
    });

    it('should pass batch write when number of items = 5 also data should be written only on second database', async function() {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteDataBasedOnParam_2(5);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service2, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);

      const batchGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
              {
                tuid: {
                  S: 'tuid_4'
                },
                cid: {
                  N: '4'
                }
              },
              {
                tuid: {
                  S: 'tuid_5'
                },
                cid: {
                  N: '5'
                }
              },
              {
                tuid: {
                  S: 'tuid_6'
                },
                cid: {
                  N: '6'
                }
              },
              {
                tuid: {
                  S: 'tuid_7'
                },
                cid: {
                  N: '7'
                }
              },
              {
                tuid: {
                  S: 'tuid_8'
                },
                cid: {
                  N: '8'
                }
              }
            ]
          }
        }
      };

      const returnCount2 = 5;
      const batchGetResponse2 = await helper.performBatchGetTest(ddb_service2, batchGetParams, true, returnCount2);

      const returnCount = 1;
      const batchGetResponse = await helper.performBatchGetTest(ddb_service, batchGetParams, true, returnCount);
    });

    /*it('should pass batch write when number of items = 25', async function () {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(25);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);
    });

    it('should pass batch write when number of items = 25', async function () {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(25);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service2, batchWriteParams, true);
      assert.empty(batchWriteResponse.data.UnprocessedItems);
    });

    it('should fail batch write when number of items > 25', async function () {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(26);
      await helper.performBatchWriteTest(ddb_service, batchWriteParams, false);
    });

    it('should fail batch write when number of items > 25', async function () {
      this.timeout(100000);

      const batchWriteParams = testDataSource.getBatchWriteData(26);
      const batchWriteResponse = await helper.performBatchWriteTest(ddb_service2, batchWriteParams, false);
    });
    */
    // size related tests

    after(async function() {
      this.timeout(100000);
      // runs after all tests in this block
      await helper.deleteTable(ddb_service, testDataSource.DELETE_TABLE_DATA, true);
      await helper.deleteTable(ddb_service2, testDataSource.DELETE_TABLE_DATA, true);
    });
  });
}
// mocha tests/mocha/services/dynamodb/
// mocha tests/mocha/services/dynamodb/batch_write.js

openStStorageObject1 = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);
ddb_service1 = openStStorageObject1.dynamoDBService;

openStStorageObject2 = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES_2);
ddb_service2 = openStStorageObject2.dynamoDBService;

performTest(ddb_service1);
performMultipleTest(ddb_service1, ddb_service2);
