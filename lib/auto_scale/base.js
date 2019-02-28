'use strict';

/**
 * DynamoDB Auto scale Library Base class
 *
 * @module lib/auto_scale/base
 *
 */

//Load external files

require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk');
AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  OSTBase = require('@ostdotcom/base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

/**
 * Constructor for base class
 *
 * @constructor
 */
const Base = function() {
  const oThis = this,
    configStrategy = oThis.ic().configStrategy;

  const autoscaleParams = {
    apiVersion: configStrategy.storage.autoScaling.apiVersion,
    accessKeyId: configStrategy.storage.autoScaling.apiKey,
    secretAccessKey: configStrategy.storage.autoScaling.apiSecret,
    region: configStrategy.storage.autoScaling.region,
    endpoint: configStrategy.storage.autoScaling.endpoint,
    sslEnabled: configStrategy.storage.autoScaling.enableSsl == 1,
    logger: configStrategy.storage.enableLogging == 1 ? console : ''
  };

  oThis.autoScaling = new AWS.ApplicationAutoScaling(autoscaleParams);
};

Base.prototype = {
  /**
   * Call dynamoDB methods
   *
   * @params {String} method - method name
   * @params {Object} params - Parameters
   *
   * @return {Promise<result>}
   *
   */
  call: function(method, ...methodArgs) {
    const oThis = this,
      autoScalingInstance = oThis.autoScaling,
      methodRef = autoScalingInstance[method];
    // return promise
    return new Promise(function(onResolve) {
      try {
        // validate if the autoScaling instance is available
        if (!autoScalingInstance)
          return onResolve(
            responseHelper.error({
              internal_error_identifier: 'l_as_b_call_1',
              api_error_identifier: 'invalid_auto_scale_instance',
              debug_options: {},
              error_config: coreConstants.ERROR_CONFIG
            })
          );

        // validate if the method is available
        if (!methodRef)
          return onResolve(
            responseHelper.error({
              internal_error_identifier: 'l_as_b_call_2',
              api_error_identifier: 'invalid_method_ref',
              debug_options: {},
              error_config: coreConstants.ERROR_CONFIG
            })
          );

        methodArgs.push(function(err, data) {
          if (err) {
            logger.error('Error from AutoScaling ', err);
            return onResolve(
              responseHelper.error({
                internal_error_identifier: 'l_as_b_call_3',
                api_error_identifier: 'auto_scale_method_call_error',
                debug_options: { error: err.stack },
                error_config: coreConstants.ERROR_CONFIG
              })
            );
          } else {
            logger.debug(data); // successful response
            return onResolve(responseHelper.successWithData(data));
          }
        });

        methodRef.apply(autoScalingInstance, methodArgs);
      } catch (err) {
        logger.error('lib/auto_scale/base.js:call inside catch ', err);
        return onResolve(
          responseHelper.error({
            internal_error_identifier: 'l_as_b_call_4',
            api_error_identifier: 'exception',
            debug_options: { error: err.stack },
            error_config: coreConstants.ERROR_CONFIG
          })
        );
      }
    });
  }
};

InstanceComposer.registerAsShadowableClass(Base, coreConstants.icNameSpace, 'getLibAutoScaleBase');

module.exports = Base;
