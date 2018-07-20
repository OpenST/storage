"use strict";

const rootPrefix = '..'
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

/**
 * Constructor for ddbapi config class
 */

const DdbApiConfig = function (configStrategy, instanceComposer) {
  const oThis = this
  ;

  oThis.OS_DAX_API_VERSION = configStrategy.OS_DAX_API_VERSION;
  oThis.OS_DAX_ACCESS_KEY_ID = configStrategy.OS_DAX_ACCESS_KEY_ID;
  oThis.OS_DAX_SECRET_ACCESS_KEY = configStrategy.OS_DAX_SECRET_ACCESS_KEY;
  oThis.OS_DAX_ENDPOINT = configStrategy.OS_DAX_ENDPOINT;
  oThis.OS_DAX_REGION = configStrategy.OS_DAX_REGION;
  oThis.OS_DAX_ENABLED = configStrategy.OS_DAX_ENABLED;
  oThis.OS_DAX_SSL_ENABLED = (configStrategy.OS_DAX_SSL_ENABLED == 1);

  oThis.OS_DYNAMODB_LOGGING_ENABLED = configStrategy.OS_DYNAMODB_LOGGING_ENABLED;
  oThis.OS_DYNAMODB_SSL_ENABLED = configStrategy.OS_DYNAMODB_SSL_ENABLED;

  oThis.OS_DYNAMODB_API_VERSION = configStrategy.OS_DYNAMODB_API_VERSION;
  oThis.OS_DYNAMODB_ACCESS_KEY_ID = configStrategy.OS_DYNAMODB_ACCESS_KEY_ID;
  oThis.OS_DYNAMODB_SECRET_ACCESS_KEY = configStrategy.OS_DYNAMODB_SECRET_ACCESS_KEY;
  oThis.OS_DYNAMODB_REGION = configStrategy.OS_DYNAMODB_REGION;
  oThis.OS_DYNAMODB_ENDPOINT = configStrategy.OS_DYNAMODB_ENDPOINT;


  oThis.OS_DYNAMODB_SSL_ENABLED = (configStrategy.OS_DYNAMODB_SSL_ENABLED == 1);

  if (configStrategy.OS_DYNAMODB_LOGGING_ENABLED == 1) {
    oThis.logger = console;
  }
};

InstanceComposer.register(DdbApiConfig, 'getDdbApiConfig', true);

module.exports = DdbApiConfig;
