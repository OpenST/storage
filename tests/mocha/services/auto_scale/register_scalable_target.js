"use strict";

// Load external packages
const Chai = require('chai')
  , assert = Chai.assert
;

// Load dependencies package
const rootPrefix = "../../../.."
  , ApplicationAutoScalingKlass = require(rootPrefix + "/index").AutoScaling
  , DdbApiKlass = require(rootPrefix + "/index").Dynamodb
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , helper = require(rootPrefix + "/tests/mocha/services/auto_scale/helper")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
;

const autoScaleObj = new ApplicationAutoScalingKlass(testConstants.AUTO_SCALE_CONFIGURATIONS_REMOTE)
  , dynamodbApiObject = new DdbApiKlass(testConstants.CONFIG_STRATEGIES)
;

let resourceId = 'table/' + testConstants.transactionLogTableName
  , roleARN = null;

const createTestCasesForOptions = function(optionsDesc, options, toAssert) {
  optionsDesc = optionsDesc || "";

  options = options || {invalidARN : false};
  it(optionsDesc, async function () {
    this.timeout(100000);
    let arn = roleARN;
    if (options.invalidARN) {
      arn = 'invalidArn';
    }
    const params = {
      ResourceId: resourceId, /* required */
      ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
      ServiceNamespace: 'dynamodb' , /* required */
      MaxCapacity: 15,
      MinCapacity: 1,
      RoleARN: arn

    };
    const response = await autoScaleObj.registerScalableTarget(params);
    logger.log(response);
    assert.equal(response.isSuccess(), toAssert, "Not able to register Scalable Target");
  });
};

describe('services/auto_scale/api#registerScalableTarget', function () {

  before(async function() {
    this.timeout(1000000);

    const returnObject = await helper.createTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
    roleARN = returnObject.role_arn;
  });

  createTestCasesForOptions("Register scalable target happy case", null, true);

  createTestCasesForOptions("Register scalable target with wrong arn", {invalidARN : true}, false);

  after(async function(){
    this.timeout(1000000);

    await helper.cleanTestCaseEnvironment(dynamodbApiObject, autoScaleObj);
  });

});