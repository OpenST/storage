"use strict";

/**
 * DynamoDB service api
 *
 * @module services/dynamodb/table_exists
 *
 */

const rootPrefix  = "../.."
  , InstanceComposer = require(rootPrefix + '/instance_composer')
  , DDBServiceBaseKlass = require(rootPrefix + "/services/dynamodb/base")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
;

require(rootPrefix + "/config/core_constants");

/**
 * Constructor for TableExist service class
 *
 * @params {Object} params - TableExist configurations
 * @params {String} TableName - name of table
 *
 * @constructor
 */
const TableExist = function(params) {
  const oThis = this
  ;

  DDBServiceBaseKlass.call(oThis, 'describeTable', params);
};

TableExist.prototype = Object.create(DDBServiceBaseKlass.prototype);

const TableExistPrototype = {

  /**
   * Validation of params
   *
   * @return {result}
   *
   */
  validateParams: function () {
    const oThis = this
      , coreConstants = oThis.ic().getCoreConstants()
      , baseValidationResponse = DDBServiceBaseKlass.prototype.validateParams.call(oThis)
    ;
    if (baseValidationResponse.isFailure()) return baseValidationResponse;

    if (!oThis.params.TableName) return responseHelper.error({
        internal_error_identifier:"l_dy_te_validateParams_1",
        api_error_identifier: "invalid_table_name",
        debug_options: {},
        error_config: coreConstants.ERROR_CONFIG
    });

    return responseHelper.successWithData({});
  },

  /**
   * Check if Table exists using describe table
   *
   * @params {object} params - Parameters
   *
   * @return {Promise} true/false
   *
   */
  executeDdbRequest: function() {
    const oThis = this
    ;
    return new Promise(async function (onResolve) {
      const describeTableResponse = await oThis.ic().getLibDynamoDBBase().queryDdb('describeTable', oThis.params, 'raw');
      if (describeTableResponse.isFailure()) {
        return onResolve(responseHelper.successWithData({response: false, status: "DELETED"}));
      }
      const tableStatus = describeTableResponse.data.Table.TableStatus || "";
      return onResolve(responseHelper.successWithData({response: tableStatus === "ACTIVE", status: tableStatus}));
    });
  },

};

Object.assign(TableExist.prototype, TableExistPrototype);
TableExist.prototype.constructor = TableExist;

InstanceComposer.registerShadowableClass(Base, 'getDDBServiceTableExist');

module.exports = TableExist;