'use strict';

/**
 * Load all the constants from the mocha tests
 *
 * @module tests/mocha/services/dynamodb/constants
 *
 */

/**
 * Constructor for mocha test constants
 *
 * @constructor
 */
const MochaTestConstants = function() {};

MochaTestConstants.prototype = {
  CONFIG_STRATEGIES: {
    ddbTablePrefix: 'de_ma_',
    cache: {
      engine: 'memcached',
      servers: ['127.0.0.1:11211'],
      defaultTtl: 36000
    },
    storage: {
      endpoint: 'http://localhost:8000',
      region: 'localhost',
      apiVersion: '2012-08-10',
      apiKey: 'X',
      apiSecret: 'X',
      enableSsl: '0',
      enableLogging: '0',
      enableAutoscaling: '0',
      enableDax: '0',
      maxRetryCount: 1,
      autoScaling: {
        endpoint: 'http://localhost:8000',
        region: 'localhost',
        apiKey: 'X',
        apiSecret: 'X',
        apiVersion: '2012-08-10',
        enableSsl: '0',
        enableLogging: '0'
      }
    }
  },

  CONFIG_STRATEGIES_2: {
    ddbTablePrefix: 'de_ma_',
    cache: {
      engine: 'memcached',
      servers: ['127.0.0.1:11211'],
      defaultTtl: 36000
    },
    storage: {
      endpoint: 'http://localhost:8001',
      region: 'localhost',
      apiVersion: '2012-08-10',
      apiKey: 'X',
      apiSecret: 'X',
      enableSsl: '0',
      enableLogging: '1',
      enableAutoscaling: '0',
      enableDax: '0',
      maxRetryCount: 1,
      autoScaling: {
        endpoint: 'http://localhost:8001',
        region: 'localhost',
        apiKey: 'X',
        apiSecret: 'X',
        apiVersion: '2016-02-06',
        enableSsl: '0',
        enableLogging: '0'
      }
    }
  },

  dummyTestTableName: 'shard_00001_dummy_table'
};

module.exports = new MochaTestConstants();
