'use strict';

/**
 * AutoScale service api
 *
 * @module services/autoScale/api
 *
 */

const rootPrefix = '../..',
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/services/autoScale/Base');

/**
 * Constructor for AutoScale api service class
 *
 * @params {Object} params - AutoScale connection configurations
 *
 * @constructor
 */
const AutoScaleApiService = function() {};

AutoScaleApiService.prototype = {
  /**
   * Register scalable Target
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  registerScalableTarget: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'AutoScaleServicesBase'),
      createAutoScalingGroup = new ASServiceBaseKlass('registerScalableTarget', params);
    return createAutoScalingGroup.perform();
  },

  /**
   * Put Scaling Policy
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  putScalingPolicy: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'AutoScaleServicesBase'),
      createAutoScalingGroup = new ASServiceBaseKlass('putScalingPolicy', params);
    return createAutoScalingGroup.perform();
  },

  /**
   * Delete Scaling policy
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  deleteScalingPolicy: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'AutoScaleServicesBase'),
      createAutoScalingGroup = new ASServiceBaseKlass('deleteScalingPolicy', params);
    return createAutoScalingGroup.perform();
  },

  /**
   * De Register Scalable Target
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  deregisterScalableTarget: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'AutoScaleServicesBase'),
      createAutoScalingGroup = new ASServiceBaseKlass('deregisterScalableTarget', params);
    return createAutoScalingGroup.perform();
  },

  /**
   * Describe Scalable Targets
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  describeScalableTargets: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'AutoScaleServicesBase'),
      createAutoScalingGroup = new ASServiceBaseKlass('describeScalableTargets', params);
    return createAutoScalingGroup.perform();
  },

  /**
   * Describe scaling policies
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  describeScalingPolicies: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getShadowedClassFor(coreConstant.icNameSpace, 'AutoScaleServicesBase'),
      createAutoScalingGroup = new ASServiceBaseKlass('describeScalingPolicies', params);
    return createAutoScalingGroup.perform();
  }
};

AutoScaleApiService.prototype.constructor = AutoScaleApiService;

InstanceComposer.registerAsObject(AutoScaleApiService, coreConstant.icNameSpace, 'autoScaleApiService', true);

module.exports = AutoScaleApiService;
