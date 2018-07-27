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
      const batchGetParams = {
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
      await helper.performBatchGetTest(ddbServiceObject, batchGetParams, true, returnCount);
    });

    it('batch get partial valid cases', async function() {
      this.timeout(100000);
      const batchGetParams = {
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
      await helper.performBatchGetTest(ddbServiceObject, batchGetParams, true, returnCount);
    });

    it('batch get zero keys', async function() {
      this.timeout(100000);
      const batchGetParams = {
        RequestItems: {
          [testConstants.transactionLogTableName]: {
            Keys: []
          }
        }
      };
      let returnCount = 0;
      await helper.performBatchGetTest(ddbServiceObject, batchGetParams, false, returnCount);
    });

    it('batch get none key match keys', async function() {
      this.timeout(100000);
      const batchGetParams = {
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
      await helper.performBatchGetTest(ddbServiceObject, batchGetParams, true, returnCount);
    });

    after(function() {
      // runs after all tests in this block
      console.log('after function called');
    });
  });
}

function performMultipleTest(ddbServiceObject1, ddbServiceObject2) {
  describe('Batch Multiple Get', function() {
    before(async function() {
      this.timeout(100000);

      // check if table exists
      const checkTableExistsResponse1 = await ddbServiceObject1.checkTableExist(testDataSource.DELETE_TABLE_DATA);
      const checkTableExistsResponse2 = await ddbServiceObject2.checkTableExist(testDataSource.DELETE_TABLE_DATA);
      if (checkTableExistsResponse1.data.response === true) {
        // delete if table exists
        await helper.deleteTable(ddbServiceObject1, testDataSource.DELETE_TABLE_DATA, true);
      }
      if (checkTableExistsResponse2.data.response === true) {
        // delete if table exists
        await helper.deleteTable(ddbServiceObject2, testDataSource.DELETE_TABLE_DATA, true);
      }

      // create table for the test
      await helper.createTable(ddbServiceObject1, testDataSource.CREATE_TABLE_DATA, true);
      await helper.createTable(ddbServiceObject2, testDataSource.CREATE_TABLE_DATA, true);

      // populate test data
      const batchWriteParams1 = testDataSource.getBatchWriteDataBasedOnParam(4);
      const batchWriteParams2 = testDataSource.getBatchWriteDataBasedOnParam_2(4);
      await helper.performBatchWriteTest(ddbServiceObject1, batchWriteParams1, true);
      await helper.performBatchWriteTest(ddbServiceObject2, batchWriteParams2, true);
    });

    it('gets data from different dynamodb instances', async function() {
      this.timeout(100000);
      const batchGetParams1 = {
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
              }
            ]
          }
        }
      };

      const batchGetParams2 = {
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
              }
            ]
          }
        }
      };
      let returnCount = 4;
      await helper.performBatchGetTest(ddbServiceObject1, batchGetParams1, true, returnCount);
      await helper.performBatchGetTest(ddbServiceObject2, batchGetParams2, true, returnCount);
    });

    it('fails as data is fetched from wrong dynamodb instances', async function() {
      this.timeout(100000);
      const batchGetParams1 = {
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

      const batchGetParams2 = {
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
      let returnCount = 0;
      await helper.performBatchGetTest(ddbServiceObject1, batchGetParams1, true, returnCount);
      await helper.performBatchGetTest(ddbServiceObject2, batchGetParams2, true, returnCount);
    });
  });
}

openStStorageObject1 = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);
ddb_service1 = openStStorageObject1.dynamoDBService;

openStStorageObject2 = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES_2);
ddb_service2 = openStStorageObject2.dynamoDBService;

performTest(ddb_service1);
performMultipleTest(ddb_service1, ddb_service2);

// mocha tests/mocha/services/dynamodb/
