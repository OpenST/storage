"use strict";

/**
 * AutoScale service api
 *
 * @module services/auto_scale/api
 *
 */

const rootPrefix  = "../.."
  , InstanceComposer = require(rootPrefix + '/instance_composer')
  , ASBase = require(rootPrefix+'/lib/auto_scale/base')
  , ASServiceBaseKlass = require(rootPrefix + "/services/auto_scale/base")
;
require(rootPrefix+'/lib/auto_scale/base');

/**
 * Constructor for AutoScale api service class
 *
 * @params {Object} params - AutoScale connection configurations
 *
 * @constructor
 */
const AutoScaleService = function(params) {
  const oThis = this
  ;

  oThis.autoScaleObject = new ASBase(params);
};

AutoScaleService.prototype = {

  /**
   * Register scalable Target
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  registerScalableTarget: function(params) {
    const oThis = this
      , createAutoScalingGroup = new ASServiceBaseKlass(oThis.autoScaleObject, 'registerScalableTarget', params)
    ;
    return createAutoScalingGroup.perform();
  },

  /**
   * Put Scaling Policy
   *
   * @param {Object} params - Parameters
   *
   * @return {*}
   */
  putScalingPolicy:function(params) {
    const oThis = this
      , createAutoScalingGroup = new ASServiceBaseKlass(oThis.autoScaleObject, 'putScalingPolicy', params)
    ;
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
    const oThis = this
      , createAutoScalingGroup = new ASServiceBaseKlass(oThis.autoScaleObject, 'deleteScalingPolicy', params)
    ;
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
    const oThis = this
      , createAutoScalingGroup = new ASServiceBaseKlass(oThis.autoScaleObject, 'deregisterScalableTarget', params)
    ;
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
    const oThis = this
      , createAutoScalingGroup = new ASServiceBaseKlass(oThis.autoScaleObject, 'describeScalableTargets', params)
    ;
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
    const oThis = this
      , createAutoScalingGroup = new ASServiceBaseKlass(oThis.autoScaleObject, 'describeScalingPolicies', params)
    ;
    return createAutoScalingGroup.perform();
  }
};

AutoScaleService.prototype.constructor = AutoScaleService;
module.exports = AutoScaleService;