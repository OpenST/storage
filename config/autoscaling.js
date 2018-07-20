"use strict";

const rootPrefix = '..'
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

/**
 * Constructor for auto-scaling config class
 */
const AutoScalingConfig = function (configStrategy, instanceComposer) {
  const oThis = this
  ;

  oThis.apiVersion = configStrategy.OS_AUTOSCALING_API_VERSION;
  oThis.accessKeyId = configStrategy.OS_AUTOSCALING_ACCESS_KEY_ID;
  oThis.secretAccessKey = configStrategy.OS_AUTOSCALING_SECRET_ACCESS_KEY;
  oThis.region = configStrategy.OS_AUTOSCALING_REGION;
  oThis.endpoint = configStrategy.OS_AUTOSCALING_ENDPOINT;

  oThis.sslEnabled = (configStrategy.OS_AUTOSCALING_SSL_ENABLED == 1);

  if (configStrategy.OS_AUTOSCALING_LOGGING_ENABLED == 1) {
    oThis.logger = console;
  }
};

InstanceComposer.register(AutoScalingConfig, 'getAutoScalingConfig', true);

module.exports = AutoScalingConfig;
