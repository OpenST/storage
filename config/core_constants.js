"use strict";

/**
 * Load all the core constants from the environment variables OR define them as literals here and export them.
 *
 * @module config/core_constants
 *
 */

const rootPrefix = '..'
  , paramErrorConfig = require(rootPrefix + '/config/error/param')
  , apiErrorConfig = require(rootPrefix + '/config/error/general')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

/**
 * Constructor for core constants
 *
 * @constructor
 */
const CoreConstants = function (configStrategy, instanceComposer) {
  const oThis = this
  ;

  // STORAGE CACHING ENGINE
  oThis.CACHING_ENGINE = configStrategy.OST_CACHING_ENGINE;

  // Generic env variable across NPM packages
  oThis.DEBUG_ENABLED = configStrategy.OST_DEBUG_ENABLED;

  oThis.DYNAMODB_TABLE_NAME_PREFIX = configStrategy.OS_DYNAMODB_TABLE_NAME_PREFIX || '';
};

CoreConstants.prototype = {

  /**
   * DynamoDB API Versions.<br><br>
   *
   * @constant {string}
   *
   */
  CACHING_ENGINE: null,

  // Generic env variable across NPM packages
  DEBUG_ENABLED: null,

  DYNAMODB_TABLE_NAME_PREFIX: null,

  DYNAMODB_API_VERSION: '2012-08-10',

  ERROR_CONFIG: {
    param_error_config: paramErrorConfig,
    api_error_config: apiErrorConfig
  }
};

InstanceComposer.register(CoreConstants, 'getCoreConstants', true);

module.exports = CoreConstants;