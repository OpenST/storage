'use strict';

// Load external packages
const Chai = require('chai'),
  assert = Chai.assert;

// Load dependencies package
const rootPrefix = '../../../..',
  openStStorage = require(rootPrefix + '/index'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  helper = require(rootPrefix + '/tests/mocha/services/auto_scale/helper'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

const openStStorageObject = openStStorage.getInstance(testConstants.CONFIG_STRATEGIES),
  autoScaleObj = openStStorageObject.ic.getAutoScaleService(),
  dynamodbApiObject = openStStorageObject.dynamoDBService;

let resourceId = 'table/' + testConstants.transactionLogTableName,
  roleARN = null;

const createTestCasesForOptions = function(optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || '';

  options = options || { invalid_service_name: false };

  it(optionsDesc, async function() {
    this.timeout(100000);

    let resId = resourceId;
    if (options.invalid_service_id) {
      resId = 'invalidResId';
    } else {
      const scalableTargetParams = {
        ResourceId: resId /* required */,
        ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
        ServiceNamespace: 'dynamodb' /* required */,
        MaxCapacity: 15,
        MinCapacity: 1,
        RoleARN: roleARN
      };
      const registerScalableTargetResponse = await autoScaleObj.registerScalableTarget(scalableTargetParams);
      assert.equal(registerScalableTargetResponse.isSuccess(), true, 'registerScalableTarget failed');
    }
    const params = {
      ResourceId: resId,
      ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
      ServiceNamespace: 'dynamodb'
    };
    const response = await autoScaleObj.deregisterScalableTarget(params);

    logger.log(response);
    assert.equal(response.isSuccess(), toAssert, 'deregisterScalableTarget failed');
  });
};

describe('services/auto_scale/api#deregisterScalableTarget', function() {
  before(async function() {
    this.timeout(1000000);

    const returnObject = await helper.createTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
    roleARN = returnObject.role_arn;
  });

  createTestCasesForOptions('DeRegister scalable target happy case', null, true);

  createTestCasesForOptions(
    'DeRegister scalable target having invalid res id case',
    { invalid_service_id: true },
    false
  );

  after(async function() {
    this.timeout(1000000);
    await helper.cleanTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
  });
});
