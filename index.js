/**
 * Index File for OST Storage
 */

'use strict';

const rootPrefix = '.',
  version = require(rootPrefix + '/package.json').version,
  OSTBase = require('@ostdotcom/base'),
  coreConstant = require(rootPrefix + '/config/coreConstant');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/services/dynamodb/api');
require(rootPrefix + '/services/autoScale/api');
require(rootPrefix + '/lib/models/shardHelper');

const OSTStorage = function(configStrategy) {
  const oThis = this,
    instanceComposer = (oThis.ic = new InstanceComposer(configStrategy)),
    DynamodbShardHelper = instanceComposer.getShadowedClassFor(coreConstant.icNameSpace, 'DynamodbShardHelper'),
    dynamoDBApiService = instanceComposer.getInstanceFor(coreConstant.icNameSpace, 'dynamoDBApiService'),
    autoScaleApiService = instanceComposer.getInstanceFor(coreConstant.icNameSpace, 'autoScaleApiService');

  if (!configStrategy) {
    throw 'Mandatory argument configStrategy missing';
  }

  oThis.version = version;

  const model = (oThis.model = {});
  model.DynamodbShardHelper = DynamodbShardHelper;

  oThis.dynamoDBService = dynamoDBApiService;
  oThis.autoScalingService = autoScaleApiService;
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
