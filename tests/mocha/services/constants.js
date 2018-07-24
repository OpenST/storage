
"use strict";

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

  /**
   * DynamoDB default configuration
   *
   * @constant {object}
   *
   */
  DYNAMODB_DEFAULT_CONFIGURATIONS : {
    'apiVersion': '2012-08-10',
    'accessKeyId': 'x',
    'secretAccessKey': 'x',
    'region': 'localhost',
    'logger': console,
    'sslEnabled': false,
    'endpoint': "http://localhost:8000"
  },

  /**
   * DynamoDB AWS Account configuration
   *
   * @constant {object}
   *
   */
  DYNAMODB_CONFIGURATIONS_REMOTE : {
    'apiVersion': '2012-08-10',
    'accessKeyId': 'x',
    'secretAccessKey': 'x',
    'region': 'localhost',
    'logger': console,
    'sslEnabled': false,
    'endpoint': "http://localhost:8000"
  },

  /**
   * auto scale configuration
   *
   * @constant {object}
   *
   */
  AUTO_SCALE_CONFIGURATIONS_REMOTE : {
    'apiVersion': '2016-02-06',
    'accessKeyId': 'x',
    'secretAccessKey': 'x',
    'region': 'localhost',
    'logger': console,
    'sslEnabled': false,
    'endpoint': "http://localhost:8000"
  },

  CONFIG_STRATEGIES: {
    OST_DEBUG_ENABLED:'1',
    OS_DYNAMODB_API_VERSION: '2012-08-10',
    OS_DYNAMODB_ACCESS_KEY_ID: 'x',
    OS_DYNAMODB_SECRET_ACCESS_KEY: 'x',
    OS_DYNAMODB_REGION: 'localhost',
    OS_DYNAMODB_ENDPOINT: 'http://localhost:8000',
    OS_DYNAMODB_SSL_ENABLED: '0',
    OS_DYNAMODB_LOGGING_ENABLED: '1',

    OS_DAX_API_VERSION: '2012-08-10',
    OS_DAX_ACCESS_KEY_ID: 'x',
    OS_DAX_SECRET_ACCESS_KEY: 'x',
    OS_DAX_REGION: 'localhost',
    OS_DAX_ENDPOINT: "http://localhost:8000",
    OS_DAX_SSL_ENABLED: false,

    OS_DAX_ENABLED: false,

    AUTO_SCALE_DYNAMO: '0',
    OS_AUTOSCALING_API_VERSION: '2016-02-06' ,
    OS_AUTOSCALING_ACCESS_KEY_ID: 'x' ,
    OS_AUTOSCALING_SECRET_ACCESS_KEY: 'x' ,
    OS_AUTOSCALING_REGION: 'localhost',
    OS_AUTOSCALING_ENDPOINT: 'http://localhost:8000',
    OS_AUTOSCALING_SSL_ENABLED: '0',
    OS_AUTOSCALING_LOGGING_ENABLED: '1',
    OS_DYNAMODB_TABLE_NAME_PREFIX: 'd_pk_',
    OST_CACHING_ENGINE: 'memcached',
    OST_CACHE_CONSISTENT_BEHAVIOR: 1,
    OST_REDIS_HOST: '127.0.0.1',
    OST_REDIS_PORT: 6379,
    OST_REDIS_PASS: 'st123',
    OST_REDIS_TLS_ENABLED: 0,
    OST_DEFAULT_TTL: '36000',
    OST_CACHE_ENDPOINT: '127.0.0.1:6379',
    OST_CACHING_ID: 'alphanumericString',
    OST_MEMCACHE_SERVERS: '127.0.0.1:11211',

  },

  transactionLogTableName: 'shard_00001_transaction_logs',

  shardEntityType: 'tokenBalance',

  shardTableName: 'shard_00001_user_balances',



};

module.exports = new MochaTestConstants();


