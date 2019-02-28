'use strict';

/**
 * Load all the core constants from the environment variables OR define them as literals here and export them.
 *
 * @module config/coreConstant
 *
 */

const rootPrefix = '..',
  paramErrorConfig = require(rootPrefix + '/config/error/param'),
  apiErrorConfig = require(rootPrefix + '/config/error/general');

/**
 * Constructor for core constants
 *
 * @constructor
 */
const CoreConstant = function() {
  const oThis = this;

  // Generic env variable across NPM packages
  oThis.DEBUG_ENABLED = process.env.OST_DEBUG_ENABLED;

  oThis.DAX_API_VERSION = '';
  oThis.DAX_ACCESS_KEY_ID = '';
  oThis.DAX_SECRET_ACCESS_KEY = '';
  oThis.DAX_REGION = '';
  oThis.DAX_ENDPOINT = '';
  oThis.DAX_SSL_ENABLED = '';
};

CoreConstant.prototype = {
  // Generic env variable across NPM packages
  DEBUG_ENABLED: null,

  ERROR_CONFIG: {
    param_error_config: paramErrorConfig,
    api_error_config: apiErrorConfig
  },

  get icNameSpace() {
    return 'OSTStorage';
  },

  // in ms fixed time after which we would retry
  fixedRetryAfterTime: function() {
    return 25;
  },

  // in ms variable time (which is incremented after every iteration) which we would retry
  variableRetryAfterTime: function() {
    return 25;
  },

  // default retry count
  defaultRetryCount: function() {
    return 50;
  }
};

module.exports = new CoreConstant();
