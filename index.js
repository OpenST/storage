/**
 * Index File for OST Storage
 */

'use strict';

const rootPrefix = '.',
  version = require(rootPrefix + '/package.json').version,
  OSTBase = require('@ostdotcom/base'),
  coreConstants = require(rootPrefix + '/config/core_constants');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/services/dynamodb/api');
require(rootPrefix + '/services/auto_scale/api');
require(rootPrefix + '/lib/models/shard_helper');

const OSTStorage = function(configStrategy) {
  const oThis = this,
    instanceComposer = (oThis.ic = new InstanceComposer(configStrategy)),
    ShardHelper = instanceComposer.getShadowedClassFor(coreConstants.icNameSpace, 'getShardHelperKlass'),
    ddbServiceObj = instanceComposer.getInstanceFor(coreConstants.icNameSpace, 'getDynamoDBService'),
    autoScalingObject = instanceComposer.getInstanceFor(coreConstants.icNameSpace, 'getAutoScaleService');

  if (!configStrategy) {
    throw 'Mandatory argument configStrategy missing';
  }

  oThis.version = version;

  const model = (oThis.model = {});
  model.ShardHelper = ShardHelper;

  oThis.dynamoDBService = ddbServiceObj;
  oThis.autoScalingService = autoScalingObject;
};

const getInstanceKey = function(configStrategy) {
  return [
    configStrategy.storage.apiVersion,
    configStrategy.storage.apiKey,
    configStrategy.storage.region,
    configStrategy.storage.endpoint,
    configStrategy.storage.enableSsl,

    configStrategy.storage.autoScaling.apiVersion,
    configStrategy.storage.autoScaling.apiKey,
    configStrategy.storage.autoScaling.region,
    configStrategy.storage.autoScaling.endpoint,
    configStrategy.storage.autoScaling.enableSsl
  ].join('-');
};

const instanceMap = {};

const Factory = function() {};

Factory.prototype = {
  getInstance: function(configStrategy) {
    // check if instance already present
    let instanceKey = getInstanceKey(configStrategy),
      _instance = instanceMap[instanceKey];

    if (!_instance) {
      _instance = new OSTStorage(configStrategy);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

const factory = new Factory();
OSTStorage.getInstance = function() {
  return factory.getInstance.apply(factory, arguments);
};

module.exports = OSTStorage;
