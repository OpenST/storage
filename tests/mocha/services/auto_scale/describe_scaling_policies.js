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

    const scalingPolicy = {
      ServiceNamespace: 'dynamodb',
      ResourceId: 'table/' + testConstants.transactionLogTableName,
      ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
      PolicyName: testConstants.transactionLogTableName + '-scaling-policy',
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingScalingPolicyConfiguration: {
        PredefinedMetricSpecification: {
          PredefinedMetricType: 'DynamoDBWriteCapacityUtilization'
        },
        ScaleOutCooldown: 60,
        ScaleInCooldown: 60,
        TargetValue: 70.0
      }
    };
    const putScalingPolicyResponse = await autoScaleObj.putScalingPolicy(scalingPolicy);
    assert.equal(putScalingPolicyResponse.isSuccess(), true, 'putScalingPolicy failed');

    const params = {
      ServiceNamespace: serviceNameSpace
    };

    const response = await autoScaleObj.describeScalingPolicies(params);

    logger.log(response);
    assert.equal(response.isSuccess(), toAssert, 'describeScalingPolicies failed');
  });
};

describe('services/auto_scale/api#describeScalingPolicies', function() {
  before(async function() {
    this.timeout(1000000);

    const returnObject = await helper.createTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
    roleARN = returnObject.role_arn;
  });

  createTestCasesForOptions('Describe scaling policy happy case', null, true);

  createTestCasesForOptions('Describe scaling policy having invalid name case', { invalid_service_name: true }, false);

  after(async function() {
    this.timeout(1000000);
    await helper.cleanTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
  });
});
