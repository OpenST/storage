'use strict';

// Load external packages
const Chai = require('chai'),
  assert = Chai.assert;

// Load dependencies package
const rootPrefix = '../../../..',
  OSTStorage = require(rootPrefix + '/index'),
  coreConstant = require(rootPrefix + '/config/coreConstant'),
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  helper = require(rootPrefix + '/tests/mocha/services/auto_scale/helper'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

const ostStorage = OSTStorage.getInstance(testConstants.CONFIG_STRATEGIES),
  autoScaleObj = ostStorage.ic.getInstanceFor(coreConstant.icNameSpace, 'autoScaleApiService'),
  dynamodbApiObject = ostStorage.dynamoDBService;

let resourceId = 'table/' + testConstants.dummyTestTableName,
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

describe('services/autoScale/api#deregisterScalableTarget', function() {
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
