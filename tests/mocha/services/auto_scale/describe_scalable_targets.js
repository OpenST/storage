'use strict';

// Load external packages
const Chai = require('chai'),
  assert = Chai.assert;

// Load dependencies package
const rootPrefix = '../../../..',
  openStStorage = require(rootPrefix + '/index'),
  coreConstants = require(rootPrefix + '/config/core_constants'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  helper = require(rootPrefix + '/tests/mocha/services/auto_scale/helper'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

const openStStorageObject = openStStorage.getInstance(testConstants.CONFIG_STRATEGIES),
  autoScaleObj = openStStorageObject.ic.getInstanceFor(coreConstants.icNameSpace,'getAutoScaleService'),
  dynamodbApiObject = openStStorageObject.dynamoDBService;

let resourceId = 'table/' + testConstants.transactionLogTableName,
  roleARN = null;

const createTestCasesForOptions = function(optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || '';

  options = options || { invalid_service_name: false };

  it(optionsDesc, async function() {
    this.timeout(100000);

    let serviceNameSpace = 'dynamodb';
    if (options.invalid_service_name) {
      serviceNameSpace = 'invalidResId';
    }

    const scalableTargetParams = {
      ResourceId: resourceId /* required */,
      ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
      ServiceNamespace: 'dynamodb' /* required */,
      MaxCapacity: 15,
      MinCapacity: 1,
      RoleARN: roleARN
    };
    const registerScalableTargetResponse = await autoScaleObj.registerScalableTarget(scalableTargetParams);
    assert.equal(registerScalableTargetResponse.isSuccess(), true, 'registerScalableTarget failed');

    const params = {
      ServiceNamespace: serviceNameSpace
    };

    const response = await autoScaleObj.describeScalableTargets(params);

    logger.log(response);
    assert.equal(response.isSuccess(), toAssert, 'describeScalableTargets failed');
  });
};

describe('services/auto_scale/api#describeScalableTargets', function() {
  before(async function() {
    this.timeout(1000000);

    const returnObject = await helper.createTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
    roleARN = returnObject.role_arn;
  });

  createTestCasesForOptions('Describe scalable targets happy case', null, true);

  createTestCasesForOptions(
    'Describe scalable targets having invalid service name case',
    { invalid_service_name: true },
    false
  );

  after(async function() {
    this.timeout(1000000);
    await helper.cleanTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
  });
});
