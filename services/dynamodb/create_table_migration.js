"use strict";

/**
 * DynamoDB create table migration having multiple services
 *  1. Create table
 *  2. Check active table status
 *  2. Enable continuous back up
 *  3. Enable auto scaling
 *
 * @module services/dynamodb/create_table_migration
 *
 */

const rootPrefix  = "../.."
  , DDBServiceBaseKlass = require(rootPrefix + "/services/dynamodb/base")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
;

/**
 * Constructor for TableExist service class
 *
 * @params {Object} ddbObject - DynamoDB Object
 * @params {Object} autoScalingObject - auto scaling Object
 * @params {Object} params - params
 * @params {Object} params.createTableConfig - create table configurations
 * @params {Object} params.autoScalingConfig - scaling params
 * @params {Object} params.autoScalingConfig.registerScalableTargetWrite - register Scalable Target write configurations
 * @params {Object} params.autoScalingConfig.registerScalableTargetRead - register Scalable Target read configurations
 * @params {Object} params.autoScalingConfig.putScalingPolicyWrite- Put scaling policy write configurations
 * @params {Object} params.autoScalingConfig.putScalingPolicyRead - Put scaling policy read configurations
 * @params {Object} params.autoScalingConfig.globalSecondaryIndex - Auto Scaling configuration of Global Secondary Indexes
 *
 * @constructor
 */
const CreateTableMigration = function(ddbObject, autoScalingObject ,params) {
  const oThis = this
  ;
  oThis.autoScalingObject = autoScalingObject;
  oThis.createTableConfig = params.createTableConfig;
  //oThis.updateContinuousBackupConfig = params.updateContinuousBackupConfig;
  oThis.autoScalingConfig = params.autoScalingConfig;
  logger.debug("\nparams.createTableConfig", params.createTableConfig, "\nparams.autoScalingConfig", params.autoScalingConfig);
  //logger.debug("\nautoScalingMethods");
  //console.log(Object.getOwnPropertyNames(autoScalingObject));
  oThis.shouldAutoScale = !!oThis.autoScalingObject;

  DDBServiceBaseKlass.call(oThis, ddbObject, 'createTableMigration', params);
};

CreateTableMigration.prototype = Object.create(DDBServiceBaseKlass.prototype);

const CreateTableMigrationPrototype = {

  /**
   * Validation of params
   *
   * @return {result}
   *
   */
  validateParams: function () {
    const oThis = this
      , baseValidationResponse = DDBServiceBaseKlass.prototype.validateParams.call(oThis)
    ;
    if (baseValidationResponse.isFailure()) return baseValidationResponse;

    if (!oThis.params.createTableConfig) {
      return responseHelper.error({
        internal_error_identifier:"l_dy_ctm_validateParams_2",
        api_error_identifier: "invalid_create_table_config",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
      });
    }

    // if (!oThis.params.updateContinuousBackupConfig) {
    //   return responseHelper.error('l_dy_ctm_validateParams_3', 'updateContinuousBackupConfig config is mandatory');
    // }

    if (oThis.shouldAutoScale) {

      if (oThis.autoScalingObject.constructor.name !== 'AutoScaleService') {
        return responseHelper.error({
          internal_error_identifier:"l_dy_ctm_validateParams_1",
          api_error_identifier: "invalid_auto_scale_object",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        });
      }

      if (!oThis.params.autoScalingConfig){
        return responseHelper.error({
          internal_error_identifier:"l_dy_ctm_validateParams_4",
          api_error_identifier: "invalid_auto_scale_config",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        });
      }

      if (!oThis.params.autoScalingConfig.registerScalableTargetWrite){
        return responseHelper.error({
          internal_error_identifier:"l_dy_ctm_validateParams_5",
          api_error_identifier: "invalid_register_scalable_target_write",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        });
      }

      if (!oThis.params.autoScalingConfig.registerScalableTargetRead){
        return responseHelper.error({
          internal_error_identifier:"l_dy_ctm_validateParams_6",
          api_error_identifier: "invalid_register_scalable_target_read",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        });
      }

      if (!oThis.params.autoScalingConfig.putScalingPolicyWrite){
        return responseHelper.error({
          internal_error_identifier:"l_dy_ctm_validateParams_7",
          api_error_identifier: "invalid_put_scaling_policy_write",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        });
      }

      if (!oThis.params.autoScalingConfig.putScalingPolicyRead){
        return responseHelper.error({
          internal_error_identifier:"l_dy_ctm_validateParams_8",
          api_error_identifier: "invalid_put_scaling_policy_read",
          debug_options: {},
          error_config: coreConstants.ERROR_CONFIG
        });
      }
    } else {
      logger.warn("AutoScale Object is not provided. Auto Scaling will not be done for the same");
    }

    return responseHelper.successWithData({});
  },

  /**
   * run create table migration
   *
   * @params {Object} params - Parameters
   *
   * @return {Promise} true/false
   *
   */
  // TODO Refactor to small methods
  executeDdbRequest: function() {
    const oThis = this
      ;
    return new Promise(async function (onResolve) {

      logger.info("Creating table..");
      const createTableResponse = await oThis.ddbObject.queryDdb('createTable', oThis.createTableConfig,'raw');
      if(createTableResponse.isFailure()){
        return onResolve(createTableResponse);
      }

      const roleARN = createTableResponse.data.TableDescription.TableArn
        , gsiArray = createTableResponse.data.TableDescription.GlobalSecondaryIndexes || []
        , tableName = oThis.createTableConfig.TableName
        , waitForTableExistsParams = {TableName: tableName}
      ;
      logger.debug("Table arn :", roleARN);

      logger.info("Waiting for table creation..");
      const waitForTableExistsResponse = await oThis.ddbObject.queryDdb('waitFor','tableExists', waitForTableExistsParams,'raw');
      if(waitForTableExistsResponse.isFailure()){
        return onResolve(waitForTableExistsResponse);
      }
      logger.info(tableName + " Table created..");

      if (oThis.shouldAutoScale) {

        oThis.autoScalingConfig.registerScalableTargetWrite.RoleARN = roleARN;
        oThis.autoScalingConfig.registerScalableTargetRead.RoleARN = roleARN;

        logger.info("Register auto scaling read/write target started..");
        let registerAutoScalePromiseArray = []
          , putAutoScalePolicyArray = []
        ;
        // registerAutoScale for table
        registerAutoScalePromiseArray.push(oThis.autoScalingObject.registerScalableTarget(oThis.autoScalingConfig.registerScalableTargetWrite));
        registerAutoScalePromiseArray.push(oThis.autoScalingObject.registerScalableTarget(oThis.autoScalingConfig.registerScalableTargetRead));

        // registerAutoScale for index
        for (let index=0; index < gsiArray.length; index++) {
          let gsi = gsiArray[index]
            , indexName = gsi.IndexName
            , indexArn = gsi.IndexArn
            , gsiParamObject = oThis.autoScalingConfig.globalSecondaryIndex[indexName];

          // Ignore if one of GSI auto scale config is not passed
          // In that case default read/write of GSI capacity will be used
          if(!gsiParamObject) continue;

          gsiParamObject.registerScalableTargetWrite.RoleARN = indexArn;
          gsiParamObject.registerScalableTargetRead.RoleARN = indexArn;

          registerAutoScalePromiseArray.push(oThis.autoScalingObject.registerScalableTarget(gsiParamObject.registerScalableTargetWrite));
          registerAutoScalePromiseArray.push(oThis.autoScalingObject.registerScalableTarget(gsiParamObject.registerScalableTargetRead));
        }

        const registerAutoScalePromiseResponse = await Promise.all(registerAutoScalePromiseArray);

        for (let index=0; index < registerAutoScalePromiseResponse.length; index++) {
          if (registerAutoScalePromiseResponse[index].isFailure()) {
            return onResolve(registerAutoScalePromiseResponse[index]);
          }
        }
        logger.info("Register auto scaling read/write target done.");

        logger.info("Putting auto scale read/write policy..");
        // putAutoScalePolicy For Table
        putAutoScalePolicyArray.push(oThis.autoScalingObject.putScalingPolicy(oThis.autoScalingConfig.putScalingPolicyWrite));
        putAutoScalePolicyArray.push(oThis.autoScalingObject.putScalingPolicy(oThis.autoScalingConfig.putScalingPolicyRead));

        // putAutoScalePolicy For index
        for (let index=0; index < gsiArray.length; index++) {
          let gsi = gsiArray[index]
            , indexName = gsi.IndexName
            , gsiParamObject = oThis.autoScalingConfig.globalSecondaryIndex[indexName];

          // Ignore if one of GSI auto scale config is not passed
          // In that case default read/write of GSI capacity will be used
          if(!gsiParamObject) continue;

          putAutoScalePolicyArray.push(oThis.autoScalingObject.putScalingPolicy(gsiParamObject.putScalingPolicyWrite));
          putAutoScalePolicyArray.push(oThis.autoScalingObject.putScalingPolicy(gsiParamObject.putScalingPolicyRead));
        }

        const putAutoScalePolicyPromiseResponse = await Promise.all(putAutoScalePolicyArray);

        for (let index=0; index < putAutoScalePolicyPromiseResponse.length; index++) {
          if (putAutoScalePolicyPromiseResponse[index].isFailure()) {
            return onResolve(putAutoScalePolicyPromiseResponse[index]);
          }
        }

        logger.info("Putting auto scale read/write policy done.");
      }

      // logger.info("Enable continuous backup started..");
      // const continuousBackupResponse = await oThis.ddbObject.queryDdb('updateContinuousBackups', oThis.updateContinuousBackupConfig, 'raw');
      // if(continuousBackupResponse.isFailure()){
      //   return onResolve(continuousBackupResponse);
      // }
      // logger.info("Enable continuous backup done.");

      const describeTableParams = {TableName: tableName}
        , describeTableResponse = await oThis.ddbObject.queryDdb('describeTable', describeTableParams,'raw')
       ;

      onResolve(describeTableResponse)
    });
  },

};

Object.assign(CreateTableMigration.prototype, CreateTableMigrationPrototype);
CreateTableMigration.prototype.constructor = CreateTableMigration;
module.exports = CreateTableMigration;