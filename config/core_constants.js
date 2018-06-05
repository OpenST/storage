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
;

/**
 * Constructor for core constants
 *
 * @constructor
 */
const CoreConstants = function() {};

CoreConstants.prototype = {

  /**
   * DynamoDB API Versions.<br><br>
   *
   * @constant {string}
   *
   */
  DYNAMODB_API_VERSION: '2012-08-10',

  // STORAGE CACHING ENGINE
  CACHING_ENGINE: process.env.OS_CACHING_ENGINE || "none",

  ERROR_CONFIG: {
    param_error_config: paramErrorConfig,
    api_error_config: apiErrorConfig
  },

  // Generic env variable across NPM packages
  DEBUG_ENABLED: process.env.OST_DEBUG_ENABLED || false,

  DYNAMODB_TABLE_NAME_PREFIX: process.env.OS_DYNAMODB_TABLE_NAME_PREFIX || '',

};

module.exports = new CoreConstants();