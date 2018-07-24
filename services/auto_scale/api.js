'use strict';

/**
 * AutoScale service api
 *
 * @module services/auto_scale/api
 *
 */

const rootPrefix = '../..',
  InstanceComposer = require(rootPrefix + '/instance_composer');
require(rootPrefix + '/services/auto_scale/base');

/**
 * Constructor for AutoScale api service class
 *
 * @params {Object} params - AutoScale connection configurations
 *
 * @constructor
 */
const AutoScaleService = function() {};

AutoScaleService.prototype = {
  /**
   * Register scalable Target
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  registerScalableTarget: function(params) {
    const oThis = this,
      ASServiceBaseKlass = oThis.ic().getServicesAutoScaleBase(),
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
      ASServiceBaseKlass = oThis.ic().getServicesAutoScaleBase(),
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
      ASServiceBaseKlass = oThis.ic().getServicesAutoScaleBase(),
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
      ASServiceBaseKlass = oThis.ic().getServicesAutoScaleBase(),
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
      ASServiceBaseKlass = oThis.ic().getServicesAutoScaleBase(),
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
      ASServiceBaseKlass = oThis.ic().getServicesAutoScaleBase(),
      createAutoScalingGroup = new ASServiceBaseKlass('describeScalingPolicies', params);
    return createAutoScalingGroup.perform();
  }
};

AutoScaleService.prototype.constructor = AutoScaleService;

InstanceComposer.register(AutoScaleService, 'getAutoScaleService', true);
module.exports = new AutoScaleService();
