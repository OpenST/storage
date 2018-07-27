/* global describe, it */

const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper'),
  testDataSource = require(rootPrefix + '/tests/mocha/services/dynamodb/testdata/batch_get_write_data');

function performTest(ddbServiceObject) {
  describe('Batch get', function() {
    before(async function() {
      this.timeout(100000);

      // check if table exists
      const checkTableExistsResponse = await ddbServiceObject.checkTableExist(testDataSource.DELETE_TABLE_DATA);
      if (checkTableExistsResponse.data.response === true) {
        // delete if table exists
        await helper.deleteTable(ddbServiceObject, testDataSource.DELETE_TABLE_DATA, true);
      }

      // create table for the test
      await helper.createTable(ddbServiceObject, testDataSource.CREATE_TABLE_DATA, true);

      // populate test data
      const batchWriteParams = testDataSource.getBatchWriteDataBasedOnParam(4);
      await helper.performBatchWriteTest(ddbServiceObject, batchWriteParams, true);
    });

    it('batch get happy case', async function() {
      this.timeout(100000);
      const bachGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
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
              }
            ]
          }
        }
      };
      let returnCount = 3;
      await helper.performBatchGetTest(ddbServiceObject, bachGetParams, true, returnCount);
    });

    it('batch get partial valid cases', async function() {
      this.timeout(100000);
      const bachGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
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
                  S: 'tuid_5'
                },
                cid: {
                  N: '5'
                }
              }
            ]
          }
        }
      };
      let returnCount = 2;
      await helper.performBatchGetTest(ddbServiceObject, bachGetParams, true, returnCount);
    });

    it('batch get zero keys', async function() {
      this.timeout(100000);
      const bachGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: []
          }
        }
      };
      let returnCount = 0;
      await helper.performBatchGetTest(ddbServiceObject, bachGetParams, false, returnCount);
    });

    it('batch get none key match keys', async function() {
      this.timeout(100000);
      const bachGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: [
              {
                tuid: {
                  S: 'tuid_5'
                },
                cid: {
                  N: '5'
                }
              }
            ]
          }
        }
      };
      let returnCount = 0;
      await helper.performBatchGetTest(ddbServiceObject, bachGetParams, true, returnCount);
    });

    after(function() {
      // runs after all tests in this block
      console.log('after function called');
    });
  });
}

function performMultipleTest(ddbServiceObject1, ddbServiceObject2) {
  describe('Batch Multiple Get', function() {});
}

openStStorageObject1 = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);
ddb_service1 = openStStorageObject1.dynamoDBService;

openStStorageObject2 = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES_2);
ddb_service2 = openStStorageObject2.dynamoDBService;

performTest(ddb_service1);
performMultipleTest(ddb_service1, ddb_service2);

// mocha tests/mocha/services/dynamodb/
