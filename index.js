/**
 * Index File for openst-storage
 */

'use strict';

const rootPrefix = '.',
  version = require(rootPrefix + '/package.json').version,
  InstanceComposer = require(rootPrefix + '/instance_composer');

require(rootPrefix + '/lib/models/dynamodb/token_balance');
require(rootPrefix + '/services/cache_multi_management/token_balance');
require(rootPrefix + '/services/dynamodb/api');
require(rootPrefix + '/services/auto_scale/api');
require(rootPrefix + '/lib/models/dynamodb/base');

const OpenSTStorage = function(configStrategy) {
  const oThis = this,
    instanceComposer = (oThis.ic = new InstanceComposer(configStrategy)),
    TokenBalanceModel = instanceComposer.getLibDDBTokenBalanceModel(),
    TokenBalanceCache = instanceComposer.getDDBTokenBalanceCache(),
    DynamoModelBase = instanceComposer.getLibDDBBaseModel(),
    ddbServiceObj = instanceComposer.getDynamoDBService(),
    autoScalingObject = instanceComposer.getAutoScaleService();

  if (!configStrategy) {
    throw 'Mandatory argument configStrategy missing';
  }

  oThis.version = version;

  const model = (oThis.model = {});
  model.TokenBalance = TokenBalanceModel;
  model.DynamoBase = DynamoModelBase;

  const cache = (oThis.cache = {});
  cache.TokenBalance = TokenBalanceCache;

  oThis.dynamoDBService = ddbServiceObj;
  oThis.autoScalingService = autoScalingObject;
};

const getInstanceKey = function(configStrategy) {
  return [
    configStrategy.OS_DAX_API_VERSION,
    configStrategy.OS_DAX_ACCESS_KEY_ID,
    configStrategy.OS_DAX_REGION,
    configStrategy.OS_DAX_ENDPOINT,
    configStrategy.OS_DAX_SSL_ENABLED,

    configStrategy.OS_DYNAMODB_API_VERSION,
    configStrategy.OS_DYNAMODB_ACCESS_KEY_ID,
    configStrategy.OS_DYNAMODB_REGION,
    configStrategy.OS_DYNAMODB_ENDPOINT,
    configStrategy.OS_DYNAMODB_SSL_ENABLED,

    configStrategy.OS_AUTOSCALING_API_VERSION,
    configStrategy.OS_AUTOSCALING_ACCESS_KEY_ID,
    configStrategy.OS_AUTOSCALING_REGION,
    configStrategy.OS_AUTOSCALING_ENDPOINT,
    configStrategy.OS_AUTOSCALING_SSL_ENABLED
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
      _instance = new OpenSTStorage(configStrategy);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

const factory = new Factory();
OpenSTStorage.getInstance = function() {
  return factory.getInstance.apply(factory, arguments);
};

module.exports = OpenSTStorage;
